library flutter_mongo_realm_web;

import 'dart:convert';
import 'dart:async' show Future;
import 'package:flutter/services.dart' show rootBundle;

import 'package:flutter/material.dart';
import 'package:flutter_mongo_realm_platform_interface/flutter_mongo_realm_platform_interface.dart';

import 'package:flutter_web_plugins/flutter_web_plugins.dart';

import 'src/utils.dart';
import 'src/interop.dart';

/// The web implementation of [FlutterMongoRealmPlatform].
///
/// This class implements the `package:flutter_mongodb_realm` functionality for the web.
class FlutterMongoRealmPlugin extends FlutterMongoRealmPlatform {
  MyMongoClient _mongoClient;
  bool _injected = false;

  static void registerWith(Registrar registrar) async {
    // Registers this class as the default instance of [FlutterMongoRealmPlatform]
    FlutterMongoRealmPlatform.instance = FlutterMongoRealmPlugin();
  }

  // init and connect

  Future<void> _init() async {
    if (!_injected) {
      // Inject the desired libraries

      await injectJSLibraries(
          ["https://unpkg.com/realm-web/dist/bundle.iife.js"]);

      String utilsAsset = await rootBundle.loadString(
          'packages/flutter_mongo_realm_web/assets/js/realmUtils.js');
      injectJsFromAsset(src: utilsAsset);

      _mongoClient = MyMongoClient();
      _injected = true;
    }
  }

  @override
  Future connectToMongo(String appId) async {
    await _init();
    _mongoClient.connectMongo(appId);
    return Future.value(true);
  }

  // document methods

  @override
  Future insertDocument({
    @required String collectionName,
    @required String databaseName,
    @required Map<String, Object> data,
  }) async {
    var id =
        await _mongoClient.insertDocument(databaseName, collectionName, data);
    return Future.value(id);
  }

  @override
  Future insertDocuments({
    @required String collectionName,
    @required String databaseName,
    @required List<String> list,
  }) async {
    var map =
        await _mongoClient.insertDocuments(databaseName, collectionName, list);
    return Future.value(map.map<int, String>(
        (key, value) => MapEntry<int, String>(int.parse(key), value)));
  }

  @override
  Future findDocuments(
      {String collectionName,
      String databaseName,
      dynamic filter,
      String projection,
      int limit,
      String sort}) async {
    var list =
        await _mongoClient.findDocuments(databaseName, collectionName, filter);
    return Future.value(list);
  }

  @override
  Future findFirstDocument(
      {String collectionName,
      String databaseName,
      dynamic filter,
      String projection}) async {
    //todo, ADD: final String projection = call.arguments['projection'];

    var list =
        await _mongoClient.findDocument(databaseName, collectionName, filter);
    return Future.value(list);
  }

  @override
  Future deleteDocument(
      {String collectionName, String databaseName, dynamic filter}) async {
    String resultString =
        await _mongoClient.deleteDocument(databaseName, collectionName, filter);
    Map<String, dynamic> map = json.decode(resultString);

    return Future.value(map["deletedCount"]);
  }

  @override
  Future deleteDocuments(
      {String collectionName, String databaseName, dynamic filter}) async {
    String resultString = await _mongoClient.deleteDocuments(
        databaseName, collectionName, filter);
    Map<String, dynamic> map = json.decode(resultString);

    return Future.value(map["deletedCount"]);
  }

  @override
  Future countDocuments(
      {String collectionName, String databaseName, dynamic filter}) async {
    var size =
        await _mongoClient.countDocuments(databaseName, collectionName, filter);
    return Future.value(size);
  }

  @override
  Future updateDocument(
      {String collectionName,
      String databaseName,
      String filter,
      String update}) async {
    String resultString = await _mongoClient.updateDocument(
        databaseName, collectionName, filter, update);
    Map<String, dynamic> map = json.decode(resultString);

    return Future.value(<int>[map["matchedCount"], map["modifiedCount"]]);
  }

  @override
  Future updateDocuments(
      {String collectionName,
      String databaseName,
      String filter,
      String update}) async {
    String resultString = await _mongoClient.updateDocuments(
        databaseName, collectionName, filter, update);
    Map<String, dynamic> map = json.decode(resultString);

    return Future.value(<int>[map["matchedCount"], map["modifiedCount"]]);
  }

  // login methods

  @override
  Future signInAnonymously() async {
    var authResult = await _mongoClient.loginAnonymously();
    return Future.value(authResult);
  }

  @override
  Future signInWithUsernamePassword(String username, String password) async {
    var authResult =
        await _mongoClient.signInWithUsernamePassword(username, password);
    return Future.value(authResult);
  }

  @override
  Future signInWithGoogle(String authCode) async {
    var authResult = await _mongoClient
        .signInWithGoogle(authCode); // implementation incomplete
    return Future.value(authResult);
  }

  @override
  Future signInWithFacebook(String accessToken) async {
    var authResult = await _mongoClient
        .signInWithFacebook(accessToken); // implementation incomplete
    return Future.value(authResult);
  }

  @override
  Future signInWithCustomJwt(String accessToken) async {
    var authResult = await _mongoClient.signInWithCustomJwt(accessToken);
    return Future.value(authResult);
  }

  @override
  Future signInWithCustomFunction(String json) async {
    var authResult = await _mongoClient.signInWithCustomFunction(json);
    return Future.value(authResult);
  }

  @override
  Future logout() async {
    await _mongoClient.logout();
    return Future.value(true);
  }

  // registration methods

  @override
  Future<bool> registerWithEmail(String email, String password) async {
    var authResult = await _mongoClient.registerWithEmail(email, password);
    return Future.value(authResult);
  }

  @override
  Future<bool> sendResetPasswordEmail(String email) async {
    await _mongoClient.sendResetPasswordEmail(email);
    return Future.value(true);
  }

  // user information methods

  @override
  Future getUserId() async {
    var id = await _mongoClient.getUserId();
    return Future.value(id);
  }

  @override
  Future getUser() async {
    var authResult = await _mongoClient.getUser();
    return Future.value(authResult);
  }

  // callFunction method

  @override
  Future callFunction(String name, {List args, int requestTimeout}) async {
    var result = _mongoClient.callFunction(name, args); //, timeout);
    return Future.value(result);
  }

  // STREAM SOLUTION

  @override
  Future setupWatchCollection(String collectionName, String databaseName,
      {List<String> ids, bool asObjectIds, String filter}) {
    if (filter == null) {
      if (ids == null || ids.isEmpty) {
        _mongoClient.setupWatchCollection(databaseName, collectionName);
      } else {
        _mongoClient.setupWatchCollection(
            databaseName, collectionName, [ids, asObjectIds]);
      }
    } else {
      _mongoClient.setupWatchCollection(databaseName, collectionName, filter);
    }

    return Future.value(true);
  }
}
