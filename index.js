const Events = require('events');

class Timer extends Events{
    constructor(){
        this._timer = {};
    }

    /**
     * 日期时间函数
     * 调用方法：now();
     * @return (String) 返回现在的时间YYYY-mm-dd HH:ii:ss
     */
    static now() {
        let date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hour = date.getHours(),
            min = date.getMinutes(),
            sec = date.getSeconds();

        hour = (hour < 10 ? "0" : "") + hour;
        min = (min < 10 ? "0" : "") + min;
        sec = (sec < 10 ? "0" : "") + sec;
        month = (month < 10 ? "0" : "") + month;
        day = (day < 10 ? "0" : "") + day;
        return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
    };

    /**
     * 延时函数
     * 调用方法：delay(delay, callback[, target, param_1, param_2, [......]]);
     * @param delay (Number)  延时时间，单位为毫秒
     * @param callback (Function) 延时函数
     * @param target [object] 调用延时函数的对象
     * @param param_1 [*] 函数入参1
     * @param param_2 [*] 函数入参2
     * .....
     */
    static delay() {
        let delay = parseInt(arguments[0], 10);
        let callback = arguments[1];
        let target = null;
        let params = null;
        delay = isNaN(delay) ? 0 : delay;
        if (arguments.length >= 3) {
            target = arguments[2];
            params = arguments.length > 3 ? Array.prototype.slice.call(arguments, 3) : null;
        }

        if (typeof(callback) === 'function') {
            if (delay === 0) {
                callback.apply(target, params);
            } else {
                let timeout = setTimeout(function () {
                    clearTimeout(timeout);
                    callback.apply(target, params);
                }, delay);
            }
        }
    };

    /***
     * 启动timer
     * @param countdown
     * @param interval
     * @param name
     */
    start(countdown, interval, name) {
        if (!name || typeof name != 'string')
            name = 'default';

        if (this._timer[name] && this._timer[name].started === true)
            clearInterval(this._timer[name].handle);

        countdown = parseInt(countdown, 10);
        if (countdown <= 0 || isNaN(countdown))
            countdown = -1;

        interval = parseInt(interval, 10);
        if (interval <= 0 || isNaN(interval))
            interval = 1000;

        this._timer[name] = {started: true, handle: 0, countdown: countdown, elapsed: 0, interval: interval};

        this.emit('start', 0, countdown, name);
        this._timer[name].handle = setInterval(() => {this._tick(name);}, interval);
    };

    /***
     * 停止timer
     * @param name
     */
    stop(name) {
        if (this._timer[name]) {
            this._timer[name].started = false;
            clearInterval(this._timer[name].handle);
            this.emit('stop', this._timer[name].elapsed, this._timer[name].countdown, name);
        }
    };

    _tick (name) {
        if (this._timer[name].countdown === 0)
            this.stop(name);
        else {
            this._timer[name].elapsed++;
            this._timer[name].countdown--;
            this.emit('tick', this._timer[name].elapsed, this._timer[name].countdown, name);
        }
    };

    /***
     * 延长
     * @param number
     * @param name
     */
    extend (number, name) {
        number = parseInt(number, 10);
        if (isNaN(number))
            number = 0;

        if (!name || typeof name != 'string')
            name = 'default';

        let timer = this._timer[name];
        if (timer && number > 0) {
            timer.countdown += number;
            if (timer.started !== true)
                timer.handle = setInterval(() => this.tick(name), timer.interval);
        }
    };

    /***
     * 快进
     * @param number
     * @param name
     */
    forward (number, name) {
        number = parseInt(number, 10);
        if (isNaN(number))
            number = 0;

        if (!name || typeof name != 'string')
            name = 'default';

        let timer = this._timer[name];
        if (timer && number <= timer.countdown) {
            timer.countdown -= number;
            if (timer.started !== true)
                timer.handle = setInterval(() => this.tick(name), timer.interval);
        }
    };

    /***
     * 清除
     * @param name
     */
    clear (name) {
        if (!name || typeof name != 'string')
            name = 'default';

        let timer = this._timer[name];
        if (timer) {
            this.emit('stop', timer.elapsed, timer.countdown, name);
            clearInterval(timer.handle);
            delete this._timer[name];
        }
    };

    /**
     * @param name
     * @returns {*}
     */
    get (name) {
        if (!name || typeof name != 'string')
            name = 'default';

        let timer = this._timer[name];
        if (timer) {
            return Object.assign({}, timer);
        }
        return timer;
    }
}

module.exports = Timer;