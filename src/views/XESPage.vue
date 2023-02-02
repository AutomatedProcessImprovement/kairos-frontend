<template>
    <div id="csv">
        <loading v-if="isLoading"></loading>
        <div v-else class="column">

            <h2 class="bold-h2">Column definition</h2>
            <div v-if="values.length === 0">
                <h3 class="warning">Please upload a log first.</h3>
            </div>
            <div v-else class="csv-table shadow">
                <table>
                    <thead>
                        <tr>
                            <th v-for="head in header" :key="head">
                                {{head}}
                            </th>
                        </tr>
                        <tr>
                            <th v-for="t in types" :key="t">
                                {{ t }}
                            </th>
                        </tr>
    
                    </thead>
    
                    <tbody>
                    <tr v-for="row in values" :key="row">
                        <td v-for="cell in row" :key="cell">{{cell}}</td>
                    </tr>
                    </tbody>
                </table>
                <div class="buttons">
                    <button class="btn" v-on:click="submit">Upload log</button>
                    <button class="btn" v-on:click="goToHome">Cancel</button>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import Loading from "@/components/LoadingComponent.vue";
import Service from "@/services/service.js"

export default {
    name: "XESPage",

    components: {
        Loading,
    },

    data () {
        return {
            header: [],
            types: [],
            values: [],
            isLoading: true,
        }
    },

    created() {
        this.loadCols();
    },

    methods: {
        loadCols() {
            let fileId = localStorage.fileId;
 
            Service.parseFile(fileId)
            .then(response => {
                this.header = response.data.header;
                this.types = response.data.types;
                for (const r of response.data.rows) {
                    // for (const v of r) {
                    //     this.values.push(v)
                    // }
                    this.values.push(r)
                }
                this.isLoading = false;
            })
            .catch(error => {
              const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message || error.toString();
                console.log(resMessage)
                this.isLoading = false;
            });
        },
        submit() {
            this.$router.push({name: 'parameters'})
        },
        
        goToHome(){
            this.$router.push({name: 'home'});
        }
    },
}
</script>
