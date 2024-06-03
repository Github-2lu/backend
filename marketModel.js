class CompanyDataModel{
    constructor(timeStamp, companyId, high_price, low_price, open_price, close_price, volume){
        this.timeStamp = timeStamp;
        this.companyId = companyId;
        this.high_price = high_price;
        this.low_price = low_price;
        this.open_price = open_price;
        this.close_price = close_price;
        this.volume = volume;
    }
}

module.exports = CompanyDataModel;
