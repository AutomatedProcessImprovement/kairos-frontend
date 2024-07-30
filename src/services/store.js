import { createStore } from 'vuex';

export default createStore({
    state: {
        resources: []
    },
    mutations: {
        SET_RESOURCES(state, resources) {
            console.log('Setting resources in the store:', resources);
            state.resources = resources;
        }
    },
    actions: {
        setResources({ commit }, resources) {
            console.log('Dispatching setResources action with:', resources);
            commit('SET_RESOURCES', resources);
        }
    },
    getters: {
        resources: state => state.resources
    }
});