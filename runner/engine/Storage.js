export class Storage {
    static save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage unavailable');
        }
    }

    static load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    static saveHighScore(score) {
        const current = this.load('highScore', 0);
        if (score > current) {
            this.save('highScore', score);
            return true;
        }
        return false;
    }

    static getHighScore() {
        return this.load('highScore', 0);
    }

    static saveMuteState(muted) {
        this.save('muted', muted);
    }

    static getMuteState() {
        return this.load('muted', false);
    }
}
