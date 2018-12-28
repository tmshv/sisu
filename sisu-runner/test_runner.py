from runner import compile_test


def test_compile_test():
    definition = {
        'value': 1234,
    }
    t = {
        'layer': '@def/value'
    }
    x = compile_test(definition, t)

    assert x['layer'] == 1234
