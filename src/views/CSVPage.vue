<template>
    <div>
        <!-- <loading v-if="isLoading"></loading> -->
        <div>
            <table>
                <thead>
                    <tr>
                        <th v-for="head in header" :key="head">
                            {{head}}
                        </th>
                    </tr>
                    <tr>
                        <th v-for="head in header" :key="head">
                            <select v-model="types[head]" required>
                                <option v-for="type in typeList" :key="type" :value="type.type" :selected="type.type == types[head]" :disabled="type.disabled"> {{type.text}} </option>
                            </select>
                        </th>
                    </tr>
                    <tr>
                        <th v-for="head in header" :key="head">
                            <input v-if="types[head] == 'timestamp'" placeholder="Date format" type="text" v-model="dateFormat" required />
                        </th>
                    </tr>
                </thead>

                <tbody>
                <tr v-for="row in values" :key="row">
                    <td v-for="cell in row" :key="cell">{{cell}}</td>
                </tr>
                </tbody>
            </table>
        </div>

        <div class="btn">
            <p><input class="btn btn-success"  type="submit" value="Submit" name="submit" v-on:click="submit" /></p>
        </div>
    </div>
</template>

<script>
// import Loading from "@/components/LoadingComponent.vue";
import Service from "@/services/service.js"

export default {
    name: "CSVPage",

    components: {
        // Loading,
    },

    data () {
        return {
            typeList: [
                {type: undefined, text: "Choose a type", disabled: true},
                {type: 'caseId', text: 'case id', disabled: false},
                {type: 'activity', text: 'activity', disabled: false},
                {type: 'timestamp', text: 'timestamp', disabled: false},
                {type: 'resource', text: 'resource', disabled: false},
                {type: 'case_attribute', text: 'case attribute', disabled: false},
                {type: 'event_attribute', text: 'event attribute', disabled: false}],
            header: [],
            types: [],
            values: [],
            dateFormat: '',
            isLoading: true,
        }
    },

    props: {
        delimiter: String
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
                this.header.forEach((head) => {
                    this.types[head] = null;
                })
                for (const r of response.data.rows) {
                    for (const v of r) {
                        this.values.push(v)
                    }
                }
                this.isLoading = false;
            })
            .catch(error => {
              const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message || error.toString();
                console.log(resMessage)
            });
        },
        submit() {
            let formData = new FormData();
            formData.append('types', JSON.stringify(this.types));
            formData.append('dateFormat', this.dateFormat);
            Service.updateTypes(localStorage.fileId,formData)
            .then(response => {
                console.log(response)
                this.isLoading = false;
                this.$router.push({name: 'cases'})
            })
            .catch(error => {
              const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message || error.toString();
                console.log(resMessage)
            });

        }
    },
}
</script>
