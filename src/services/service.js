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

    updateTypes(fileId,types){
        return http.post(`/update/${fileId}`,types, {headers: {
            'Content-Type': 'application/json'
          }})
    }

    parameters(fileId,parameters){
        return http.post(`/parameters/${fileId}`,parameters,{headers: {
            'Content-Type': 'application/json'
          }})
    }
    
}

export default new Service();