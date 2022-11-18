import axios from "axios"; // responsible for communicating with api
const http = axios.create({
  baseURL: "http://localhost:5000"
});


class ModelService {

    getCases() {
        return http.get('/cases');
    }

    getCaseIds() {
        return http.get('/caseIds');
    }

    getCaseModel(caseId){
        return http.get(`/cases/${caseId}/model`)
    }

    getCase(caseId){
        return http.get(`/cases/${caseId}`)
    }

    getCaseActivities(caseId){
        return http.get(`/cases/${caseId}/activities`)
    }
    
    getCaseRecommendations(caseId){
        return http.get(`/cases/${caseId}/recommendations`)
    }

    getActivities(){
        return http.get(`/activities`)
    }

    getRecommendations(){
        return http.get(`/recommendations`)
    }

    getResources(){
        return http.get(`/resources`)
    }
}

export default new ModelService();