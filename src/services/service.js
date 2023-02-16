import axios from "axios"; // responsible for communicating with api
const http = axios.create({
  baseURL: "http://localhost:5000/api"
});

import router from '@/router';

http.interceptors.response.use(null, error => {
    console.log(error.response);
    router.push({name: 'error', params: {responseStatus: error.response.status}});
    return Promise.reject(error);
  });


class Service {

    getCases() {
        return http.get('/cases');
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
    
}

export default new Service();