<template>
    <div id="error">
        <h1 class="huge bold-blue">Oops!</h1>
        <h1 v-if="responseStatus" class="bold-blue">{{responseStatus}}</h1>
        <p>Something went wrong. Please check console and try again.</p>
    </div>
</template>

<script>

export default {
    name: 'ErrorPage',

    params:{
        responseStatus: Number
    },

    created(){
        this.responseStatus = this.$route.params.responseStatus;
        console.log(this.responseStatus);
    }

}
</script>