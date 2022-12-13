import { getTheLocationFromDataset } from "./geoFindMe.js";


/////////////////////////////////////////////////////////
const uploadFiles = (() => {
	const fileRequests = new WeakMap();
	const ENDPOINTS = {
		UPLOAD: '/upload',
		UPLOAD_STATUS: '/upload-status',
		UPLOAD_REQUEST: '/upload-request'
	}
	const defaultOptions = {
		url: ENDPOINTS.UPLOAD,
		startingByte: 0,
		fileId: '',
		onAbort() {},
		onProgress() {},
		onError() {},
		onComplete() {}
	};
	

  //////////////////////////////////////////////////////////
	const uploadFileChunks = (file, options) => {
		const formData = new FormData();
		const req = new XMLHttpRequest();
		const chunk = file.slice(options.startingByte);
		
		formData.append('chunk', chunk, file.name);
		formData.append('fileId', options.fileId);
		
		req.open('POST', options.url, true);
		req.setRequestHeader('Content-Range', `bytes=${options.startingByte}-${options.startingByte+chunk.size}/${file.size}`);
		req.setRequestHeader('X-File-Id', options.fileId);
		
		req.onload = (e) => {
			// it is possible for load to be called when the request status is not 200
			// this will treat 200 only as success and everything else as failure
			if (req.status === 200) {
				// options.onComplete(e, file);
        options.onComplete({...e,
          fileId: options.fileId // VISTI appending fileid to event!
        }, file);
			}
      else {
				options.onError(e, file);
			}
		}
		
		req.upload.onprogress = (e) => {
			const loaded = options.startingByte + e.loaded;
			options.onProgress({...e,
				loaded,
				total: file.size,
				percentage: loaded * 100 / file.size,
			}, file);
		}
		
		req.ontimeout = (e) => options.onError(e, file);
		
		req.onabort = (e) => options.onAbort(e, file);
		
		req.onerror = (e) => options.onError(e, file);
		
		fileRequests.get(file).request = req;
		
		req.send(formData);
	};
	

  //////////////////////////////////////////////////////////
	const uploadFile = (file, options) => {

		return fetch(ENDPOINTS.UPLOAD_REQUEST, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				fileName: file.name,
			})
		})
			.then(res => res.json())
			.then(res => {        
				options = {...options, ...res};
				fileRequests.set(file, {request: null, options});
				uploadFileChunks(file, options);
			})
			.catch(e => {
				options.onError({...e, file})
			})
	}
	

  //////////////////////////////////////////////////////////
	const abortFileUpload = async file => {
		const fileReq = fileRequests.get(file);
		
		if (fileReq && fileReq.request) {
			fileReq.request.abort();
			return true;
		}
		
		return false;
	};
	

  //////////////////////////////////////////////////////////
	const retryFileUpload = file => {
		const fileReq = fileRequests.get(file);
		
		if (fileReq) {
			// try to get the status just in case it failed mid upload
			return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileReq.options.fileId}`)
				.then(res => res.json())
				.then(res => { // if uploaded we continue
					uploadFileChunks(file, {...fileReq.options, startingByte: Number(res.totalChunkUploaded)});
				})
				.catch(() => { // if never uploaded we start
					uploadFileChunks(file, fileReq.options)
				})
		}
	};
	

  //////////////////////////////////////////////////////////
	const clearFileUpload = async file => {
		const fileReq = fileRequests.get(file);
		
		if (fileReq) {
			await abortFileUpload(file);
			fileRequests.delete(file);
			
			return true;
		}
		
		return false;
	};
	

  //////////////////////////////////////////////////////////
	const resumeFileUpload = file => {
		const fileReq = fileRequests.get(file);
		
		if (fileReq) {
			return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileReq.options.fileId}`)
				.then(res => res.json())
				.then(res => {
					uploadFileChunks(file, {...fileReq.options, startingByte: Number(res.totalChunkUploaded)});
				})
				.catch(e => {
					fileReq.options.onError({...e, file})
				})
		}
	}


  //////////////////////////////////////////////////////////
	// return (files, fileData, options = defaultOptions) => {
  return (files, options = defaultOptions) => {
		[...files].forEach(file => uploadFile(file, {...defaultOptions, ...options}));
		
		return {
			abortFileUpload,
			retryFileUpload,
			clearFileUpload,
			resumeFileUpload
		}
	}
})();


//////////////////////////////////////////////////////////
// This is the interface part
export const uploadAndTrackFiles = (() => {
	const files = new Map();
	const progressBox = document.createElement('div');
	const FILE_STATUS = {
		PENDING: 'pending',
		UPLOADING: 'uploading',
		PAUSED: 'paused',
		COMPLETED: 'completed',
		FAILED: 'failed'
	}
	let uploader = null;
  // Vistis vars
  let filesAmount = 0;
  let amountUploaded = 0;
  let fileInfo = []; // array for associating fileId with filename!

	
	progressBox.className = 'upload-progress-tracker';
  progressBox.classList.add("expanded"); // visti
	progressBox.innerHTML = `
				<h3>Uploading 0 Files</h3>
				<p class="upload-progress">
					<span class="uploads-percentage">0%</span>
					<span class="success-count">0</span>
					<span class="failed-count">0</span>
					<span class="paused-count">0</span>
				</p>
				<button type="button" class="maximize-btn">Maximize</button>
				<div class="uploads-progress-bar" style="width: 0;"></div>
				<div class="file-progress-wrapper"></div>
			`;
	
	progressBox
		.querySelector('.maximize-btn')
		.addEventListener('click', (e) => {
			e.currentTarget.classList.toggle('expanded');
			progressBox.classList.toggle('expanded');
		})
	

  //////////////////////////////////
	const updateProgressBox = () => {
		const [title, uploadProgress, expandBtn, progressBar] = progressBox.children;
		
		if (files.size > 0) {
			let totalUploadedFiles = 0;
			let totalUploadingFiles = 0;
			let totalFailedFiles = 0;
			let totalPausedFiles = 0;
			let totalChunkSize = 0;
			let totalUploadedChunkSize = 0;
			const [uploadedPerc, successCount, failedCount, pausedCount] = uploadProgress.children;
			
			files.forEach(fileObj => {
				if(fileObj.status === FILE_STATUS.FAILED) {
					totalFailedFiles += 1;
				} else {
					if (fileObj.status === FILE_STATUS.COMPLETED) {
						totalUploadedFiles += 1;
					} else if(fileObj.status === FILE_STATUS.PAUSED) {
						totalPausedFiles += 1;
					} else {
						totalUploadingFiles += 1;
					}
					
					totalChunkSize += fileObj.size;
					totalUploadedChunkSize += fileObj.uploadedChunkSize;
				}
			});
			
			const percentage = totalChunkSize > 0 ? Math.min(100, Math.round((totalUploadedChunkSize * 100) / totalChunkSize)) : 0;
			
			title.textContent = percentage === 100
				? `Uploaded ${totalUploadedFiles} File${totalUploadedFiles !== 1 ? 's' : ''}`
				: `Uploading ${totalUploadingFiles}/${files.size} File${files.size !== 1 ? 's' : ''}`;
			uploadedPerc.textContent = `${percentage}%`;
			successCount.textContent = totalUploadedFiles;
			failedCount.textContent = totalFailedFiles;
			pausedCount.textContent = totalPausedFiles;
			progressBar.style.width = `${percentage}%`;
			progressBox.style.backgroundSize = `${percentage}%`;
			expandBtn.style.display = 'inline-block';
			uploadProgress.style.display = 'block';
			progressBar.style.display = 'block';
		} else {
			title.textContent = 'No Upload in Progress'
			expandBtn.style.display = 'none';
			uploadProgress.style.display = 'none';
			progressBar.style.display = 'none';
		}
	}
	
  //////////////////////////////////
	const updateFileElement = fileObject => {
		const [
			{children: [{children: [status]}, progressBar]}, // .file-details
			{children: [retryBtn, pauseBtn, resumeBtn, clearBtn]} // .file-actions
		] = fileObject.element.children;
		
		requestAnimationFrame(() => {
			status.textContent = fileObject.status === FILE_STATUS.COMPLETED ? fileObject.status : `${Math.round(fileObject.percentage)}%`;
			status.className = `status ${fileObject.status}`;
			progressBar.style.width = fileObject.percentage + '%';
			progressBar.style.background = fileObject.status === FILE_STATUS.COMPLETED
				? 'lightgreen' : fileObject.status === FILE_STATUS.FAILED
					? 'orange' : 'lightgreen'; // '#222';
			pauseBtn.style.display = fileObject.status === FILE_STATUS.UPLOADING ? 'inline-block' : 'none';
			retryBtn.style.display = fileObject.status === FILE_STATUS.FAILED ? 'inline-block' : 'none';
			resumeBtn.style.display = fileObject.status === FILE_STATUS.PAUSED ? 'inline-block' : 'none';
			clearBtn.style.display = fileObject.status === FILE_STATUS.COMPLETED || fileObject.status === FILE_STATUS.PAUSED
				? 'inline-block' : 'none';
			updateProgressBox();
		});
	}
	
  //////////////////////////////////
	const setFileElement = (file) => {
		const extIndex = file.name.lastIndexOf('.');
		const fileElement = document.createElement('div');
		fileElement.className = 'file-progress';
		fileElement.innerHTML = `
			<div class="file-details" style="position: relative">
				<p>
					<span class="status">pending</span>
					<span class="file-name">${file.name.substring(0, extIndex)}</span>
					<span class="file-ext">${file.name.substring(extIndex)}</span>
				</p>
				<div class="progress-bar" style="width: 0;"></div>
			</div>
			<div class="file-actions">
				<button type="button" class="retry-btn" style="display: none">Retry</button>
				<button type="button" class="cancel-btn" style="display: none">Pause</button>
				<button type="button" class="resume-btn" style="display: none">Resume</button>
				<button type="button" class="clear-btn" style="display: none">Clear</button>
			</div>
		`;
		files.set(file, {
			element: fileElement,
			size: file.size,
			status: FILE_STATUS.PENDING,
			percentage: 0,
			uploadedChunkSize: 0,
      // fileId: -1
		});
    filesAmount++;
		
		const [_, {children: [retryBtn, pauseBtn, resumeBtn, clearBtn]}] = fileElement.children;
		
		clearBtn.addEventListener('click', () => {
			uploader.clearFileUpload(file);
			files.delete(file);
			fileElement.remove();
      filesAmount--;
			updateProgressBox();
		});
		retryBtn.addEventListener('click', () => uploader.retryFileUpload(file));
		pauseBtn.addEventListener('click', () => uploader.abortFileUpload(file));
		resumeBtn.addEventListener('click', () => uploader.resumeFileUpload(file));
		progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);
	}
	
  //////////////////////////////////
	const onComplete = (e, file) => {
    
    // console.log("file:", file);
    fileInfo.push({ fileName: file.name, fileId: e.fileId });

		const fileObj = files.get(file);
		fileObj.status = FILE_STATUS.COMPLETED;
		fileObj.percentage = 100;
    amountUploaded++;

    // CHECK IF All files are done!
    if (amountUploaded == filesAmount) {

      // THIS IS WHERE ALL UPLOADS ARE DONE!
      // console.log("files:", files); // show the map!
      // console.log("fileInfo:", fileInfo);
      
      const formFiles = document.getElementById("myMedia").files;
      console.log("formFiles:", formFiles);
      const request = new XMLHttpRequest();
      const payload = new FormData();
      // append files
      for (let i=0; i < formFiles.length; i++) {
        payload.append("myMedia", formFiles[i]);
      }
      // append fileInfo
      for (let j=0; j < fileInfo.length; j++) {
        payload.append("fileInfo", JSON.stringify(fileInfo[j]));
      }
      payload.append("title", document.querySelector("#mediaForm #title").value)
      payload.append("description", document.querySelector("#mediaForm #text").value)
      payload.append("email", document.querySelector("#mediaForm #email").value)
      const loc = getTheLocationFromDataset();
      payload.append("lng", loc.lng)
      payload.append("lat", loc.lat)
      // payload.append("accuracy", loc.accuracy)

      request.open("POST", "/all-done", true); // third arg means async when true
      request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
          var jsonData = JSON.parse(request.response);
          console.log("jsonData:", jsonData);
          // I could also just reveal a button that reloads map!!!
          // should be defined in App.js!!! - to be able to access markers!
          document.getElementById("reloadBtnWrapper").classList.add("shown");
        }
        else {
          console.log('There was a problem with the request.');
        }
      };
      
      request.send(payload);
    }
    // console.log("allUploaded:", allUploaded); // works!
    // console.log("filesAmount:", filesAmount); // works!
		
		updateFileElement(fileObj);
	}
	
  //////////////////////////////////
	const onProgress = (e, file) => {
		const fileObj = files.get(file);
		
		fileObj.status = FILE_STATUS.UPLOADING;
		fileObj.percentage = e.percentage;
		fileObj.uploadedChunkSize = e.loaded;
    // fileObj.fileId = e.fileId;
    // console.log("e.fileId:", e.fileId); // WORKS!
		
		updateFileElement(fileObj);
	}
	
  //////////////////////////////////
	const onError = (e, file) => {
		const fileObj = files.get(file);
		
		fileObj.status = FILE_STATUS.FAILED;
		fileObj.percentage = 100;
		
		updateFileElement(fileObj);
	}
	
  //////////////////////////////////
	const onAbort = (e, file) => {
		const fileObj = files.get(file);
		
		fileObj.status = FILE_STATUS.PAUSED;
		
		updateFileElement(fileObj);
	}
	
	return (uploadedFiles) => {
		[...uploadedFiles].forEach(setFileElement);
		
		// document.body.appendChild(progressBox);
    document.getElementById("filesOverviewWrapper").appendChild(progressBox);
		
		uploader = uploadFiles(uploadedFiles, {
			onProgress,
			onError,
			onAbort,
			onComplete
		});
	}
})();