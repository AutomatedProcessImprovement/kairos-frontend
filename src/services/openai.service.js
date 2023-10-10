import http from './axios';

class OpenaiService {

    getChatHistory(logId){
        return http.get(`/event_logs/${logId}/openai/history`)
    }

    getAnswer(logId,data){
        return http.post(`/event_logs/${logId}/openai`,data)
    }
}

export default new OpenaiService();