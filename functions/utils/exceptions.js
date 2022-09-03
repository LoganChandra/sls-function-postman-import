class DataNotFoundException extends Error {
    constructor(message) {
        super(message);
        this.name = 'DataNotFoundException';
    }
}

class DbInsertException extends Error {
    constructor(message){
        super(message);
        this.name = 'DbInsertException';
    }
}

module.exports = {
    DataNotFoundException,
    DbInsertException
}