
import {Validator} from "../src/Validator";
import {Hexadecatet} from "../src/Hexadecatet";

describe('Hexadecatet: ', () => {
    it('should instantiate by calling constructor', () => {
        expect(new Hexadecatet(234).getValue()).toEqual(234);
        expect(new Hexadecatet("234").getValue()).toEqual(234);
    });
    it('should instantiate by passing number or string to static method', () => {
        expect(Hexadecatet.of(234).getValue()).toEqual(234);
        expect(Hexadecatet.of("234").getValue()).toEqual(234);
    });
    it('should throw an exception when invalid octet number is given', () => {
        expect(() => {
            Hexadecatet.of(65536);
        }).toThrowError(Error, Validator.invalidHexadecatetMessage);

        expect(() => {
            Hexadecatet.of(-1);
        }).toThrowError(Error, Validator.invalidHexadecatetMessage);
    });
});