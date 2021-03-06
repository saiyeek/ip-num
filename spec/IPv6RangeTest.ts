import {IPv6} from "../src/IPv6";
import {IPv6Prefix} from "../src/Prefix";
import {IPv6Range} from "../src/IPv6Range";
import {Validator} from "../src/Validator";


describe('IPv6Range: ', () => {
    it('should instantiate by calling constructor with IPv4 and prefix', () => {
        let ipv6Range = new IPv6Range(new IPv6("::"), new IPv6Prefix(0));
        expect(ipv6Range.toCidrString()).toEqual("0:0:0:0:0:0:0:0/0");
    });
    it('should instantiate from string in cidr notation', () => {
         let ipv6Range = IPv6Range.fromCidr("2001:db8::/33");
         expect(ipv6Range.toCidrString()).toEqual("2001:db8:0:0:0:0:0:0/33");
    });
    it('should return the first IPv6 number in range', () => {
        let ipv6Range = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(48));
        expect(ipv6Range.getFirst().toString()).toEqual("2001:db8:0:0:0:0:0:0");
    });
    it('should return the last IPv4 number in range', () => {
        let ipv6Range = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(48));
        expect(ipv6Range.getLast().toString()).toEqual("2001:db8:0:ffff:ffff:ffff:ffff:ffff");
    });
    it('should convert to string with range dash format', () => {
        let ipv6Range = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(48));
        expect(ipv6Range.toRangeString()).toEqual("2001:db8:0:0:0:0:0:0-2001:db8:0:ffff:ffff:ffff:ffff:ffff");
    });
    it('should return the correct list of IPv6 number when take is called', () => {
        let ipv6Range = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(48));
        let take = ipv6Range.take(3);
        expect(take[0].toString()).toBe("2001:db8:0:0:0:0:0:0");
        expect(take[1].toString()).toBe("2001:db8:0:0:0:0:0:1");
        expect(take[2].toString()).toBe("2001:db8:0:0:0:0:0:2");
    });
    it('should correctly tell if ranges are consecutive', () => {
        let firstRange = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(48));
        let secondRange = new IPv6Range(new IPv6("2001:db8:1::"), new IPv6Prefix(48));
        let anotherSecondRange = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(105));
        expect(firstRange.isConsecutive(secondRange)).toBe(true);
        expect(secondRange.isConsecutive(firstRange)).toBe(true);

        expect(firstRange.isConsecutive(anotherSecondRange)).toBe(false);
        expect(anotherSecondRange.isConsecutive(firstRange)).toBe(false);
    });
    it('should throw an exception when invalid cidr notation is used to create range', function() {
        expect(() => {
            IPv6Range.fromCidr("2001:db8:0:0:0:0/300");
        }).toThrowError(Error, Validator.invalidIPv6CidrNotationString);
    });

    it('should throw an exception when asked to take a value bigger than the size of range', function() {
        let ipv6Range = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(46));
        let errMessage = Validator.takeOutOfRangeSizeMessage
            .replace("$size", ipv6Range.getSize().toString())
            .replace("$count", (ipv6Range.getSize().plus(1)).valueOf().toString());
        expect(() => {
            ipv6Range.take(ipv6Range.getSize().plus(1).valueOf());
        }).toThrowError(Error, errMessage);
    });
    it('should throw an exception when trying to split a range with on IP number', function(){
        let ipv6Range = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(128));
        expect(() => {
            ipv6Range.split();
        }).toThrowError(Error, Validator.cannotSplitSingleRangeErrorMessage);
    });
    // xit('should correctly tell if ranges are overlapping', () => {
    //     // TODO find a way to create overlapping ranges.
    //     // TODO or confirm than normal ranges cannot overlap

    // });
    it('should correctly tell if a range contains another range', () => {
        let containerRange = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(47));
        let firstRange = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(48));
        let secondRange = new IPv6Range(new IPv6("2001:db8:1::"), new IPv6Prefix(48));

        expect(containerRange.contains(firstRange)).toBe(true);
        expect(containerRange.contains(secondRange)).toBe(true);

        expect(firstRange.contains(containerRange)).toBe(false);
        expect(secondRange.contains(containerRange)).toBe(false);
    });
    it('should correctly tell if a range is inside another range', () => {
        let containerRange = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(47));
        let firstRange = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(48));
        let secondRange = new IPv6Range(new IPv6("2001:db8:1::"), new IPv6Prefix(48));

        expect(containerRange.inside(firstRange)).toBe(false);
        expect(containerRange.inside(secondRange)).toBe(false);

        expect(firstRange.inside(containerRange)).toBe(true);
        expect(secondRange.inside(containerRange)).toBe(true);
    });
    it('should correctly tell if ranges are not overlapping', () => {
        // Consecutive ranges...
        let firstRange = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(48));
        let secondRange = new IPv6Range(new IPv6("2001:db8:1::"), new IPv6Prefix(48));
        // ...should not be overlapping
        expect(firstRange.isOverlapping(secondRange)).toBe(false);
        expect(firstRange.isOverlapping(secondRange)).toBe(false);

    });
    it('should correctly tell that containing ranges are not overlapping', () => {
        let containerRange = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(47));
        let firstRange = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(48));
        let secondRange = new IPv6Range(new IPv6("2001:db8:1::"), new IPv6Prefix(48));

        expect(firstRange.isOverlapping(secondRange)).toBe(false);
        expect(secondRange.isOverlapping(firstRange)).toBe(false);

        expect(containerRange.isOverlapping(firstRange)).toBe(false);
        expect(firstRange.isOverlapping(containerRange)).toBe(false);

    });
    it('should be able to use for in construct on range', () => {
        let ipv6Range = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(127));
        let expectedValue = ipv6Range.take(2);
        let expectedIndex = 0;
        for (let value of ipv6Range) {
            expect(value.isEquals(expectedValue[expectedIndex])).toBe(true);
            expectedIndex++;
        }
    });
    it('should split IP range correctly', () => {
        let ipv6Range = new IPv6Range(new IPv6("2001:db8::"), new IPv6Prefix(47));
        let splitRanges: Array<IPv6Range> = ipv6Range.split();
        let firstRange = splitRanges[0];
        let secondRange = splitRanges[1];

        expect(firstRange.toCidrString()).toBe("2001:db8:0:0:0:0:0:0/48");
        expect(secondRange.toCidrString()).toBe("2001:db8:1:0:0:0:0:0/48");
    })
});