import http from './axios';

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

    getCasesByLogAndCompletion(logId,caseCompletion) {
        return http.get(`/event_logs/${logId}/cases/${caseCompletion}`);
    }
}

export default new CasesService();