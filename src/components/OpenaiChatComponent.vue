<template>
    <div id="chat">
        <div class="chat-toggle" @click="toggleChat" :class="{'icon-selected': showChat}">
            <ion-icon name="chatbubbles-outline"></ion-icon>
        </div>
        <div class="chat-window" v-if="showChat">
            <div class="messages column" ref="messages">
                <div :class="['row',message.role === 'user' ? 'user-message' : 'assistant-message']" v-for="(message,index) in chatHistory" :key="index">
                    <div class="message">
                        <p>{{ message.content }}</p>
                    </div>
                </div>
                <div class="loader" v-if="answerLoading">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div class="no-messages" v-if="chatHistory.length < 1">
                <p>There are no messages yet.</p>
            </div>
            <div class="row align-center">
                <input type="text" v-model="newMessage" @keyup.enter="getAnswer" placeholder="Message">
                <ion-icon @click="getAnswer" name="chevron-forward" class="send-icon"></ion-icon>
            </div>
        </div>
    </div>
</template>

<script>

import openaiService from "@/services/openai.service";
import utils from "@/common/utils";
// import MarkdownIt from 'markdown-it'

export default {
    name: 'OpenaiChatComponent',
    props: {
        currentCase: Object,
        selectedRec: Object,
        selectedRecObject: Object,
    },

    data() {
        return {
            caseId: null,
            logId: utils.getLocal('logId'),
            showChat: false,
            answerLoading: false,

            chatHistory: [],
            newMessage: null,
        }
    },

    watch: {
        chatHistory: {
            handler() {
                if(this.showChat){
                    this.$nextTick(() => {
                        this.scrollToBottom();
                    });
                }
            },
            deep: true
        }
    },

    mounted(){
        if (this.logId){ 
            this.caseId = (this.$route.params.caseId);
            this.getChatHistory();
        }
    },

    methods: {
        toggleChat(){
            this.showChat = !this.showChat;
            if (this.showChat){
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            }
        },

        getChatHistory() {
            openaiService.getChatHistoryCase(this.logId,this.caseId).then(
                (response) => {
                    this.chatHistory = response.data.memory;
                },
                (error) => {
                    this.isLoading = false;
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.error) ||
                        error.message ||
                        error.toString();
                    this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    })
                }
            );
        },

        getAnswer() {
            this.answerLoading = true;

            let newMessage = this.newMessage;
            this.newMessage = null;

            let data = {
                'question': newMessage,
            }

            this.chatHistory.push({
                role: 'user',
                content: newMessage
            });
            
            openaiService.getAnswer(this.logId,this.caseId,data).then(
                (response) => {
                    this.chatHistory.push({
                        role: 'assistant',
                        content: response.data.answer
                    })
                    this.answerLoading = false;
                },
                (error) => {
                    this.isLoading = false;
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.error) ||
                        error.message ||
                        error.toString();
                    this.$notify({
                        title: 'An error occured',
                        text: resMessage,
                        type: 'error'
                    });
                    this.answerLoading = false;
                }
            );
        },

        scrollToBottom() {
            const container = this.$refs.messages;
            container.scrollTop = container.scrollHeight;
        }
    }
}
</script>