import http from './axios';

class OpenaiService {

    getChatHistoryLog(logId){
        return http.get(`/event_logs/${logId}/openai/history`)
    }

    getChatHistoryCase(logId,caseId){
        return http.get(`/event_logs/${logId}/cases/${caseId}/openai/history`)
    }

    getAnswer(logId,caseId,data){
        return http.post(`/event_logs/${logId}/cases/${caseId}/openai`,data)
    }
}

export default new OpenaiService();