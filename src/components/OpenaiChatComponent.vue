<template>
    <div id="chat">
        <div class="chat-toggle" @click="toggleChat" :class="{ 'icon-selected': showChat }">
            <ion-icon name="chatbubbles-outline"></ion-icon>
        </div>
        <div class="chat-window" v-if="showChat">
            <div class="messages column" ref="messages">
                <div :class="['row', message.role === 'user' ? 'user-message' : 'assistant-message']" v-for="(message, index) in chatHistory" :key="index">
                    <div class="message" v-html="markdownToHTML(message.content)">
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
                <textarea v-model="newMessage" @keyup.enter="getAnswer" placeholder="Message"></textarea>
                <ion-icon @click="getAnswer" name="chevron-forward" class="send-icon"></ion-icon>
                <ion-icon @click="deleteThread" name="trash-outline" class="send-icon"></ion-icon>
            </div>
        </div>
    </div>
</template>

<script>

import openaiService from "@/services/openai.service";
import shared from "@/services/shared";
import MarkdownIt from "markdown-it";
import DOMPurify from 'dompurify';

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
            showChat: false,
            answerLoading: false,

            chatHistory: [],
            newMessage: null,
        }
    },

    watch: {
        chatHistory: {
            handler() {
                if (this.showChat) {
                    this.$nextTick(() => {
                        this.scrollToBottom();
                    });
                }
            },
            deep: true
        }
    },

    mounted() {
        if (this.logId) {
            this.caseId = (this.$route.params.caseId);
            this.getChatHistory();
        }
    },

    methods: {

        getChatHistory() {
            openaiService.getChatHistoryCase(this.logId, this.caseId).then(
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
            if (this.answerLoading === true) return;
            if (!this.newMessage) return;
            if (this.newMessage.trim() === '') return;

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

            openaiService.getAnswer(this.logId, this.caseId, data).then(
                (response) => {
                    this.chatHistory.push({
                        role: 'assistant',
                        content: response.data.answer.content
                    })
                    console.log(response.data.answer);
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

        deleteThread() {
            openaiService.deleteThread(this.logId, this.caseId).then(
                (response) => {
                    console.log(response.data.message);
                    this.$notify({
                        title: 'Success',
                        text: response.data.message,
                        type: 'success'
                    })
                    this.getChatHistory();
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
                })
        },

        toggleChat() {
            this.showChat = !this.showChat;
            if (this.showChat) {
                this.$nextTick(() => {
                    this.scrollToBottom();
                });
            }
        },

        markdownToHTML(markdown) {
            let md = new MarkdownIt();
            var html = md.render(markdown);
            const cleanHtml = DOMPurify.sanitize(html);
            return cleanHtml;
        },

        scrollToBottom() {
            const container = this.$refs.messages;
            container.scrollTop = container.scrollHeight;
        }
    }
}
</script>