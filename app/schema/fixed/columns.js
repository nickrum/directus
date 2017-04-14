define(function(require, exports, module) {

  'use strict';

  module.exports = {
    'id': 'directus_columns',
    'table_name': 'directus_tables',
    'hidden': true,
    'single': false,
    'primary_column': 'id',

    'columns': [
      {
        'id': 'id',
        'column_name': 'id',
        'ui': 'numeric',
        'type': 'INT',
        'system': true,
        'hidden_list': true,
        'hidden_input': true,
        'sort': 0
      },
      {
        'id': 'table_name',
        'column_name': 'table_name',
        'ui': 'textinput',
        'type': 'VARCHAR',
        'system': false,
        'hidden_list': false,
        'hidden_input': false,
        'sort': 1
      },
      {
        'id': 'column_name',
        'column_name': 'column_name',
        'ui': 'textinput',
        'type': 'VARCHAR',
        'system': false,
        'hidden_list': false,
        'hidden_input': false,
        'sort': 2
      },
      {
        'id': 'data_type',
        'column_name': 'data_type',
        'ui': 'textinput',
        'type': 'VARCHAR',
        'system': false,
        'hidden_list': false,
        'hidden_input': false,
        'sort': 2
      },
      {
        'id': 'ui',
        'column_name': 'ui',
        'ui': 'textinput',
        'type': 'VARCHAR',
        'system': false,
        'hidden_list': false,
        'hidden_input': false,
        'sort': 2
      },
      {
        'id': 'relationship_type',
        'column_name': 'relationship_type',
        'ui': 'textinput',
        'type': 'VARCHAR',
        'required': false,
        'nullable': true,
        'system': false,
        'hidden_list': false,
        'hidden_input': false,
        'sort': 2
      },
      {
        'id':'hidden_input',
        'column_name':'hidden_input',
        'ui':'checkbox',
        'type':'TINYINT',
        'default_value': false,
        'system':false,
        'hidden_list':false,
        'hidden_input':false,
        'nullable': true,
        'required': false
      },
      {
        'id':'hidden_list',
        'column_name':'hidden_list',
        'ui':'checkbox',
        'type':'TINYINT',
        'default_value': false,
        'system':false,
        'hidden_list':false,
        'hidden_input':false,
        'nullable': true,
        'required': false
      },
      {
        'id': 'required',
        'column_name': 'required',
        'ui':'checkbox',
        'type':'TINYINT',
        'system':false,
        'hidden_list':false,
        'hidden_input':false,
        'nullable': true,
        'required': false
      },
      {
        'id': 'sort',
        'column_name': 'sort',
        'ui':'numeric',
        'type':'INT',
        'default_value': 0,
        'system':false,
        'hidden_list':false,
        'hidden_input':false
      },
      {
        'id': 'comment',
        'column_name': 'comment',
        'ui': 'textinput',
        'type': 'VARCHAR',
        'char_length': 255,
        'default_value': '',
        'required': false,
        'nullable': true,
        'system':false,
        'hidden_list':false,
        'hidden_input':false
      }
    ]
  };
});
