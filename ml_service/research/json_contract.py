"""Bounded callers supply bytes; reject ambiguous JSON and nonfinite numbers."""
import json


def strict_json(body):
    def object_pairs(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError()
            result[key] = value
        return result

    def reject_constant(value):
        raise ValueError()

    return json.loads(body, object_pairs_hook=object_pairs, parse_constant=reject_constant)
