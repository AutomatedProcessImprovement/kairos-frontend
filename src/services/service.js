import axios from "axios"; // responsible for communicating with api
const http = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL
});

class Service {

    getCases() {
        return http.get('/cases');
    }

    getCasesByLog(fileId) {
        return http.get(`event_logs/${fileId}/cases`);
    }

    getCase(caseId){
        return http.get(`/cases/${caseId}`)
    }

    getLogs() {
        return http.get('/event_logs');
    }

    getLog(fileId){
        return http.get(`/event_logs/${fileId}`)
    }

    getParameters(fileId){
        return http.get(`/event_logs/${fileId}/parameters`)
    }

    uploadFile(file){
        return http.post(`/upload`,file,{ headers: { 'Content-Type': 'multipart/form-data'} })
    }

    updateTypes(fileId,data){
        return http.put(`/update/${fileId}`,data, {headers: {
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
        return http.put(`/projects/${fileId}/simulate/start`)
    }

    stopSimulation(fileId){
        return http.put(`/projects/${fileId}/simulate/stop`)
    }
}

export default new Service();