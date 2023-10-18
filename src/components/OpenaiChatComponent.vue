<template>
    <div id="chat">
        <div class="chat-toggle" @click="showChat=!showChat" :class="{'icon-selected': showChat}">
            <ion-icon name="chatbubbles-outline"></ion-icon>
        </div>
        <div class="chat-window" v-if="showChat">
            <div class="messages column" ref="messages">
                <div :class="['row',message.sender === 'Human' ? 'human-message' : 'ai-message']" v-for="message in chatHistory" :key="message">
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
import shared from "@/services/shared";

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
            logId: shared.getLocal('logId'),
            showChat: true,
            answerLoading: false,

            chatHistory: [],
            newMessage: null,
        }
    },

    watch: {
        chatHistory: {
            handler() {
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
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
        getChatHistory() {
            openaiService.getChatHistory(this.logId,this.caseId).then(
                (response) => {
                    this.chatHistory = this.formatChatHistory(response.data.memory);
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

        formatChatHistory(chatHistory){
            if (!chatHistory || chatHistory === '') return [];
            const lines = chatHistory.split('\n');
            let interactions = [];

            lines.forEach(line => {
                const idx = line.indexOf(':');
                const sender = line.slice(0, idx).trim();
                const content = line.slice(idx + 2).trim();

                const interaction = {
                    'sender': sender,
                    'content': content.replace(/For case [^:]+: /, '')
                };
                interactions.push(interaction);
            });
            return interactions;
        },

        getAnswer() {
            this.answerLoading = true;

            let newMessage = this.newMessage;
            this.newMessage = null;

            let data = {
                'question': `For case ${this.caseId}: ${newMessage}`,
            }

            this.chatHistory.push({
                sender: 'Human',
                content: newMessage
            });
            
            openaiService.getAnswer(this.logId,data).then(
                (response) => {
                    this.chatHistory.push({
                        sender: 'AI',
                        content: response.data.answer
                    });
                    this.contextSaved = true;
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