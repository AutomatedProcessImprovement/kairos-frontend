import http from './axios';

class LogsService {

    getLogs() {
        return http.get('/event_logs');
    }

    getLog(logId){
        return http.get(`/event_logs/${logId}`)
    }

    deleteLog(logId){
        return http.delete(`/event_logs/${logId}`)
    }

    getParameters(logId){
        return http.get(`/event_logs/${logId}/parameters`)
    }
    getRecommendations(logId){
        return http.get(`/event_logs/${logId}/prescriptions`)
    }

    uploadLog(file){
        return http.post(`/event_logs`,file,{ headers: { 'Content-Type': 'multipart/form-data'} })
    }

    defineColumnTypes(logId,data){
        return http.put(`/event_logs/${logId}/column_types`,data, {headers: {
            'Content-Type': 'application/json'
          }})
    }

    defineParameters(logId,parameters){
        return http.post(`/event_logs/${logId}/parameters`,parameters,{headers: {
            'Content-Type': 'application/json'
          }})
    }

    // project

    getProjectStatus(logId){
        return http.get(`/event_logs/${logId}/status`)
    }

    startSimulation(logId){
        return http.put(`/event_logs/${logId}/simulate/start`)
    }

    stopSimulation(logId){
        return http.put(`/event_logs/${logId}/simulate/stop`)
    }

    clearSimulation(logId){
        return http.put(`/event_logs/${logId}/simulate/clear`)
    }

    // static results

    getStaticResults(logId){
        return http.get(`/event_logs/${logId}/results`)
    }
}

export default new LogsService();