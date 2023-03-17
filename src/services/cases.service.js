import axios from "axios"; // responsible for communicating with api
const http = axios.create({
  baseURL: "https://kairos.cloud.ut.ee/frontend_api"
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