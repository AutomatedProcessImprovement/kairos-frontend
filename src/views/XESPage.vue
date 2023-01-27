<template>
    <div>
        <loading v-if="isLoading"></loading>
        <div>
            <table class="table is-striped">
                <thead>
                    <tr class="bg-dark">
                        <th class="has-text-center text-white" v-for="head in headers">
                            {{head}}
                        </th>
                    </tr>
                    <tr class="table-success">
                        <th class="has-text-center" v-for="type in types">
                            {{type}}
                        </th>
                    </tr>
                </thead>

                <tbody>
                <tr v-for="row in values">
                    <td v-for="cell in row">{{cell}}</td>
                </tr>
                </tbody>
            </table>
        </div>

        <div class="btn">
            <p><input type="submit" @click.self="isLoading = true;" class="btn btn-success" value="Continue" name="submit" v-on:click="submit" /></p>
        </div>
    </div>
</template>

<script>
import Loading from "@/components/LoadingComponent.vue";
import Service from "@/services/service.js"

export default {
    name: "columns",
    data: function () {
        return {
            headers: [],
            types: [],
            values: [],
            token: '',
            sep: '',
            dateformat: '',
            isLoading: true,
        }
    },

    components: {
        Loading,
    },

    beforeMount() {
        this.token = this.$route.params.token;
        this.sep = this.$route.params.sep;

        const types = {}
        this.headers.forEach((head) => {
            types[head[1]] = null;
        })
        this.types = types;

        this.loadCols();

    },

    computed: {
        typesArr () {
            return Object.keys(this.types).reduce((acc, itemKey) => {
                    acc[itemKey] = this.types[itemKey];
                    return acc;
            }, new Map())
        }
    },

    methods: {
        loadCols() {
            let formData = new FormData();
            formData.append('sep', this.sep);
            Request.getAxios().post(this.$hostname + "/parse/" + this.token, formData)
            .then(response => {
                this.headers = response.data.content[0].names;
                this.types = response.data.content[0].types;

                response.data.content.forEach(x => {this.values.push(x.values)});

                this.isLoading = false;
            });
        },
        submit() {
            this.$router.push({name: "discovery-settings", params: {token: this.token}});
        }
    }
}
</script>
