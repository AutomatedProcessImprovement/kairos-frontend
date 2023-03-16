import axios from "axios"; // responsible for communicating with api
const http = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL
});

class CasesService {

    getCases() {
        return http.get('/cases');
    }

    getCase(caseId){
        return http.get(`/cases/${caseId}`)
    }

    getCasesByLog(logId) {
        return http.get(`/event_logs/${logId}/cases`);
    }
}

export default new CasesService();