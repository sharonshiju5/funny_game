export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 20) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = [];
        
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(createFn());
        }
    }

    get(...args) {
        const obj = this.pool.pop() || this.createFn();
        this.resetFn(obj, ...args);
        return obj;
    }

    release(obj) {
        this.pool.push(obj);
    }
}
