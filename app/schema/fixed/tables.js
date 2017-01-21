define(function(require, exports, module) {

  'use strict';

  module.exports = {
    "id": "directus_tables",
    "table_name": "directus_tables",
    "hidden": true,
    "single": false,
    "primary_column": "table_name",
    "url": "api/1.1/tables",

    "columns": [
      {
        "id": "table_name",
        "column_name": "table_name",
        "ui": "textinput",
        "type": "VARCHAR",
        "length": 64,
        "system": true,
        "hidden_list": false,
        "hidden_input": false,
        "required": true,
        "sort": 0,
        "comment": ""
      },
      {
        "id": "preview_url",
        "column_name": "preview_url",
        "ui": "textinput",
        "type": "VARCHAR",
        "length": 255,
        "system": true,
        "hidden_list": false,
        "hidden_input": false,
        "required": false,
        "sort": 0,
        "comment": ""
      },
      {
        "id": "columns",
        "column_name": "columns",
        "type": "ALIAS",
        "ui": "columns",
        "relationship_type": "ONETOMANY",
        "related_table": "directus_columns",
        "junction_key_right": "table_name",
        "default_value": null,
        "required": false,
        "system": false,
        "hidden_list": false,
        "hidden_input": false,
        "sort": 2,
        "options": {
          "visible_columns": "column_name,ui,relationship_type,comment",
          "add_button": 1
        }
      },
      {
        "id":"hidden",
        "column_name":"hidden",
        "ui":"checkbox",
        "type":"TINYINT",
        "default_value": false,
        "system":false,
        "hidden_list":false,
        "hidden_input":false,
        "sort": 3
      },
      {
        "id":"single",
        "column_name":"single",
        "ui":"checkbox",
        "type":"TINYINT",
        "default_value": false,
        "system":false,
        "hidden_list":false,
        "hidden_input":false,
        "sort": 4
      },
      {
        "id":"default_status",
        "column_name":"default_status",
        "ui":"textinput",
        "type":"VARCHAR",
        "default_value": 1,
        "system":false,
        "hidden_list":false,
        "hidden_input":false,
        "sort": 5
      },
      {
        "id": "footer",
        "column_name": "footer",
        "ui": "checkbox",
        "type": "TINYINT",
        "system": false,
        "hidden_list": false,
        "hidden_input": false,
        "sort": 6
      },
      {
        "id": "primary_column",
        "column_name": "primary_column",
        "ui": "textinput",
        "type": "VARCHAR",
        "length": 64,
        "system": true,
        "hidden_list": false,
        "hidden_input": false,
        "default_value": "id",
        "required": false,
        "sort": 7,
        "comment": ""
      },
      {
        "id": "sort_column",
        "column_name": "sort_column",
        "ui": "textinput",
        "type": "VARCHAR",
        "length": 64,
        "system": true,
        "hidden_list": false,
        "hidden_input": false,
        "default_value": "sort",
        "required": false,
        "sort": 8,
        "comment": ""
      },
      {
        "id": "status_column",
        "column_name": "status_column",
        "ui": "textinput",
        "type": "VARCHAR",
        "length": 64,
        "system": true,
        "hidden_list": false,
        "hidden_input": false,
        "required": false,
        "sort": 9,
        "comment": ""
      },
      {
        "id": "user_create_column",
        "column_name": "user_create_column",
        "ui": "textinput",
        "type": "VARCHAR",
        "length": 64,
        "system": false,
        "hidden_list": false,
        "hidden_input": false,
        "required": false,
        "sort": 10,
        "comment": ""
      },
      {
        "id": "user_update_column",
        "column_name": "user_update_column",
        "ui": "textinput",
        "type": "VARCHAR",
        "length": 64,
        "system": false,
        "hidden_list": false,
        "hidden_input": false,
        "required": false,
        "sort": 11,
        "comment": ""
      },
      {
        "id": "date_create_column",
        "column_name": "date_create_column",
        "ui": "textinput",
        "type": "VARCHAR",
        "length": 64,
        "system": false,
        "hidden_list": false,
        "hidden_input": false,
        "required": false,
        "sort": 12,
        "comment": ""
      },
      {
        "id": "date_update_column",
        "column_name": "date_update_column",
        "ui": "textinput",
        "type": "VARCHAR",
        "length": 64,
        "system": false,
        "hidden_list": false,
        "hidden_input": false,
        "required": false,
        "sort": 13,
        "comment": ""
      }
    ]
  };
});
