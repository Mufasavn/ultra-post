const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('ultra',{call:(name,data)=>ipcRenderer.invoke('ultra',name,data)});
