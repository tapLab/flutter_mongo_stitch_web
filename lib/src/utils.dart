import 'dart:async';
import 'dart:html' as html;

/// Injects a bunch of libraries in the <head> and returns a
/// Future that resolves when all load.
Future<void> injectJSLibraries(List<String> libraries,
    {html.HtmlElement target /*, Duration timeout */
    }) {
  final List<Future<void>> loading = <Future<void>>[];
  final List<html.HtmlElement> tags = <html.HtmlElement>[];

  libraries.forEach((String library) {
    final html.ScriptElement script = html.ScriptElement()
      ..async = true
      ..defer = true
      ..src = library;
    // TODO add a timeout race to fail this future
    loading.add(script.onLoad.first);
    tags.add(script);
  });
  (target ?? html.querySelector('head')).children.addAll(tags);
  return Future.wait(loading);
}

html.ScriptElement _createScriptTagFromSrc(String src) => html.ScriptElement()
  ..type = "text/javascript"
  ..charset = "utf-8"
  ..async = false
  //..defer = true
  ..innerText = src;

injectJsFromAsset({String src, html.HtmlElement target}) {
  print('injectJsFromAsset -> before _createScriptTagFromSrc');
  html.HtmlElement tag = _createScriptTagFromSrc(src);
  print('injectJsFromAsset -> tag: ${tag.toString()}');
  (target ?? html.querySelector('head')).children.add(tag);
  print('injectJsFromAsset -> done');
}
