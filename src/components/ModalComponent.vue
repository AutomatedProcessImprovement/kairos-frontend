<template>
    <div class="overlay transparent">
        <div id="modal">
            <h3>{{ title }}</h3>
            <slot name="content"/>
            <ion-icon name="close-outline" @click="closeModal"></ion-icon>
        </div>
    </div>
</template>

<script>
export default {
    name: "ModalComponent",

    props:{
        title: {
            type: String,
            default: 'Title'
        },
    },

    methods:{
        closeModal(){
            this.$emit('closeModal')
        }
    }
}
</script>