import {EventType} from "enum/pigeon.eventtype.enum";

function generatePatternRegex(pattern: string): RegExp {
    const regexPattern = pattern
        .replace(/:[^/]+/g, "([^/]+)")
        .replace(/\//g, "\\/");
    return new RegExp(`^${regexPattern}$`);
}

const test = /^((\w+\/)*):?\w+((\/:\w+)+)?$/g;

function isRegExp(value: any): boolean {
    return value instanceof RegExp || (typeof value === "object" && Object.prototype.toString.call(value) === "[object RegExp]");
}

export function getTopicType(topic: any): EventType {
    if (typeof topic === "string") {
        if (test.test(topic)) {
            return EventType.SEGMENT;
        }
        return EventType.STRING;
    } else if (isRegExp(topic)) {
        return EventType.REGEXP;
    } else if (Array.isArray(topic) && topic.every(elem => typeof elem === "string")) {
        return EventType.ARR_STRING;
    } else if (Array.isArray(topic) && topic.every(elem => {
        try {
            new RegExp(elem);
            return true;
        } catch (e) {
            return false;
        }
    })) {
        return EventType.ARR_REGEXP;
    } else {
        return EventType.UNKNOWN;
    }
}

export function extractSegments(url: string, pattern: string): object {
    const patternRegex = generatePatternRegex(pattern);
    const match = patternRegex.exec(url);
    if (!match) {
        return null;
    }
    const keys = pattern.match(/:[^/]+/g).map((key) => key.slice(1));
    const values = match.slice(1);
    return keys.reduce((obj, key, i) => {
        obj[key] = values[i];
        return obj;
    }, {});
}