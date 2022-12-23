import axios from "axios"; // responsible for communicating with api
const http = axios.create({
  baseURL: "http://localhost:5000/api"
});


class ModelService {

    getCases() {
        return http.get('/eventlog');
    }

    getCase(caseId){
        return http.get(`/cases/${caseId}`)
    }
    
}

export default new ModelService();