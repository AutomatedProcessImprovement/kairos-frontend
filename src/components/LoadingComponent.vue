<template>
    <div v-if="modalIsOpen">
        <div class="overlay opaque loading-overlay" :style="overlayStyle">
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
    props:{
        text: {
            type: String,
            default: 'Please wait...'
        },
        startPosition: {
            type: Number,
            default: 0
        },
    },

    computed:{
        overlayStyle(){
            return{
                left: this.startPosition,
                width: (window.innerWidth - this.startPosition) + "px",
            }
        }
    },

    data: function () {
        return {
            modalIsOpen: true,
        }
    },
}
</script>