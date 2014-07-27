/**
 * @fileOverview
 * @author kaidi.ykd
 */


var State = {
    PENDING: 0,
    FULFILLED: 1,
    REJECTED: 2
};

var transition = function (state, value) {
    if (this.state == state)
        return;
    if (this.state !== State.PENDING)
        return;
    if (state != State.FULFILLED && state != State.REJECTED)
        return;
    if (arguments.length < 2)
        return;
    this.state = state;
    this.value = value;
    this.run();
};

var then = function(onFulfilled, onRejected) {
    var promise = new Promise();
    this.queue.push({
        fulfil: typeof onFulfilled == 'function' ? onFulfilled : null,
        reject: typeof onRejected  == 'function' ? onRejected  : null,
        promise: promise
    });
};

var run = function () {
    if (this.state == State.PENDING)
        return;
    var self = this;
    setTimeout(function() {
        while(self.quene.length) {
            var obj = self.queue.shift();
            try {
                var fn = self.state == State.FULFILLED ?
                    (obj.fulfil || function(x) { return x; }) :
                    (obj.reject || function(x) { throw  x;});
                resolve(obj.promise, fn(self.value));
            } catch (e) {
                obj.promise.transaction(State.REJECTED, e);
            }
        }
    }, 0);
};

var resolve = function(promise, x) {
    if (promise == x) {
        promise.transition(State.REJECTED, new TypeError());
    }
};








var Aplus = function() {

    var State = {
        PENDING: 0,
        FULFILLED: 1,
        REJECTED: 2
    };

    var Aplus = {
        state: State.PENDING,
        changeState: function( state, value ) {

            // catch changing to same state (perhaps trying to change the value)
            if ( this.state == state ) {
                return new Error("can't transition to same state: " + state);
            }

            // trying to change out of fulfilled or rejected
            if ( this.state == State.FULFILLED ||
                this.state == State.REJECTED ) {
                return new Error("can't transition from current state: " + state);
            }

            // if second argument isn't given at all (passing undefined allowed)
            if ( state == State.FULFILLED &&
                arguments.length < 2 ) {
                return new Error("transition to fulfilled must have a non null value");
            }

            // if a null reason is passed in
            if ( state == State.REJECTED &&
                arguments.length < 2 ) {
                return new Error("transition to rejected must have a non null reason");
            }

            //change state
            this.state = state;
            this.value = value;
            this.resolve();
            return this.state;
        },
        fulfill: function( value ) {
            this.changeState( State.FULFILLED, value );
        },
        reject: function( reason ) {
            this.changeState( State.REJECTED, reason );
        },
        then: function( onFulfilled, onRejected ) {

            // initialize array
            this.cache = this.cache || [];

            var promise = Object.create(Aplus);

            var that = this;

            this.async( function() {
                that.cache.push({
                    fulfill: onFulfilled,
                    reject: onRejected,
                    promise: promise
                });
                that.resolve();
            });

            return promise;
        },
        resolve: function() {
            // check if pending
            if ( this.state == State.PENDING ) {
                return false;
            }

            // for each 'then'
            while ( this.cache && this.cache.length ) {
                var obj = this.cache.shift();

                var fn = this.state == State.FULFILLED ?
                    obj.fulfill :
                    obj.reject;


                if ( typeof fn != 'function' ) {

                    obj.promise.changeState( this.state, this.value );

                } else {

                    // fulfill promise with value or reject with error
                    try {

                        var value = fn( this.value );

                        // deal with promise returned
                        if ( value && typeof value.then == 'function' ) {
                            value.then( function( value ) {
                                obj.promise.changeState( State.FULFILLED, value );
                            }, function( error ) {
                                obj.promise.changeState( State.REJECTED, error );
                            });
                            // deal with other value returned
                        } else {
                            obj.promise.changeState( State.FULFILLED, value );
                        }
                        // deal with error thrown
                    } catch (error) {
                        obj.promise.changeState( State.REJECTED, error );
                    }
                }
            }
        },
        async: function(fn) {
            setTimeout(fn, 5);
        }
    };

    return Object.create(Aplus);

};









