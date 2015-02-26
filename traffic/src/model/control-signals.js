TRAFFIC.STATE = [ { RED: 0, GREEN: 1 } ];

TRAFFIC.ControlSignals = function (intersection) {
    this.intersection = intersection;
    this.onTick = TRAFFIC.binding(this.onTick, this);
    this.time = 0;
    this.flipMultiplier = 1 + ( TRAFFIC.random() * 0.4 - 0.2);
    this.stateNum = 0;

    Object.defineProperty(this, 'flipInterval', {
        get: function() {
            return this.flipMultiplier * TRAFFIC.settings.lightsFlipInterval;
        }
    });

    Object.defineProperty(this, 'state', {
        get: function() {
            var stringState, x, _i, _len, _results;
            stringState = this.states[this.stateNum % this.states.length];
            if (this.intersection.roads.length <= 2) { stringState = ['LFR', 'LFR', 'LFR', 'LFR']; }
            _results = [];
            for (_i = 0, _len = stringState.length; _i < _len; _i++) {
                x = stringState[_i];
                _results.push(this._decode(x));
            }
            return _results
        }
    });
}

TRAFFIC.ControlSignals.prototype = {
    constructor: TRAFFIC.ControlSignals,
    _decode : function(str) {
        var state;
        state = [0, 0, 0];
        if (TRAFFIC.indexOf.call(str, 'L') >= 0) state[0] = 1;
        if (TRAFFIC.indexOf.call(str, 'F') >= 0) state[1] = 1;
        if (TRAFFIC.indexOf.call(str, 'R') >= 0) state[2] = 1;
        return state;
    },
    flip : function() {
        return this.stateNum += 1;
    },
    onTick : function(delta) {
        this.time += delta;
        if (this.time > this.flipInterval) {
            this.flip();
            return this.time -= this.flipInterval;
        }
    }
}

TRAFFIC.ControlSignals.prototype.states = [['L', '', 'L', ''], ['FR', '', 'FR', ''], ['', 'L', '', 'L'], ['', 'FR', '', 'FR']];