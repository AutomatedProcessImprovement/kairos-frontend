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

    uploadFile(file){
        return http.post(`/upload`,file,{ headers: { 'Content-Type': 'multipart/form-data'} })
    }

    parseFile(fileId,delimiter){
        return http.post(`/parse/${fileId}`,delimiter)
    }

    updateTypes(fileId,data){
        return http.post(`/update/${fileId}`,data)
    }
    
}

export default new Service();