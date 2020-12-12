const app = new Vue({
    el: '#app',
    data: {
        name: '',
        move: '',
        moves: [],
        message: '',
        messages: [],
        socket: null
    },
    methods: {
        sendMove() {
            if (!this.validateMove())
                return;

            this.socket.emit('move', this.move);
            this.move = '';
        },
        validateMove() {
            return this.name.length > 0 && this.move.length > 0;
        },
        receivedMove(move) {
            this.moves.push(move);
        },

        sendChat() {
            if (!this.validateChat())
                return;

            this.socket.emit('chat', this.message);
            this.text = '';
        },
        validateChat() {
            return this.name.length > 0 && this.message.length > 0;
        },
        receivedMessage(message) {
            this.messages.push(message);
        },
        receivedChat(message) {
            this.messages.push(message);
        },
    },
    created() {
        this.socket = io('http://localhost:3000');
        this.socket.on('move', (payload) => {
            this.receivedMove(payload);
        });
        this.socket.on('message', (payload) => {
            this.receivedMessage(payload);
        });
        this.socket.on('chat', (payload) => {
            this.receivedChat(payload);
        });
    }
})
