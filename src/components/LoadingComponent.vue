<template>
    <div v-if="modalIsOpen">
        <div :class="[isOverlay ? 'overlay' : 'component']">
            <div id="loading">
                <ion-icon class="rotate" name="reload-circle"></ion-icon>
                {{text}}
            </div>
        </div>
    </div>
</template>

<style scoped>
    
</style>

<script>
export default {
    name: "LoadingComponent",
    data: function () {
        return {
            modalIsOpen: true,
        }
    },

    props:{
        text: {
            type: String,
            default: 'Please wait...'
        },
        isOverlay: {
            type: Boolean,
            default: true
        }
    }
}
</script>