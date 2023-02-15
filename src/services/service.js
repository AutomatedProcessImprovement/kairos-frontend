import axios from "axios"; // responsible for communicating with api
const http = axios.create({
  baseURL: "http://localhost:5000"
});

class Service {

    getCases() {
        return http.get('/cases');
    }

    getCase(caseId){
        return http.get(`/cases/${caseId}`)
    }

    getLogs() {
        return http.get('/eventlogs');
    }

    getLog(fileId){
        return http.get(`/eventlogs/${fileId}`)
    }

    uploadFile(file){
        return http.post(`/upload`,file,{ headers: { 'Content-Type': 'multipart/form-data'} })
    }

    parseFile(fileId){
        return http.get(`/parse/${fileId}`)
    }

    updateTypes(fileId,data){
        return http.post(`/update/${fileId}`,data, {headers: {
            'Content-Type': 'application/json'
          }})
    }

    parameters(fileId,parameters){
        return http.post(`/parameters/${fileId}`,parameters,{headers: {
            'Content-Type': 'application/json'
          }})
    }

    getProjectStatus(fileId){
        return http.get(`/projects/${fileId}/status`)
    }

    streamProjectStatus(fileId){
        return http.get(`/projects/${fileId}/status/stream`)
    }

    startSimulation(fileId){
        return http.get(`/projects/${fileId}/simulate/start`)
    }

    stopSimulation(fileId){
        return http.get(`/projects/${fileId}/simulate/stop`)
    }
}

export default new Service();