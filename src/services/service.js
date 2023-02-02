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
        return http.put(`/parse/${fileId}`)
    }

    updateTypes(fileId,data){
        return http.post(`/update/${fileId}`,data)
    }

    parameters(fileId,data){
        return http.post(`/parameters/${fileId}`,data)
    }
    
}

export default new Service();