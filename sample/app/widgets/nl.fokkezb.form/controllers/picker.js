/**
 * Controller for the date/time picker field type.
 *
 * The date/picker picker field type is a `Ti.UI.Label` to display current and a `Ti.UI.Picker` to change the value.
 *
 * *WARNING:* Only support iOS and Android date/time for now.
 *
 * @class Widgets.nlFokkezbForm.controllers.picker
 * @extends Widgets.nlFokkezbForm.controllers.field
 * @xtype picker
 */

var moment = require('alloy/moment');

exports.baseController = '../widgets/nl.fokkezb.form/controllers/field';

$.focus = focus;
$.setValue = setValue;
$.getValue = getValue;

var m;

var table;

var pickerShowing = false;

var picker = {
  type: Ti.UI.PICKER_TYPE_DATE,
  valueFormat: 'YYYY-MM-DD'
};

/**
 * Constructor.
 *
 * @constructor
 * @method Controller
 * @param args Arguments which will also be used to call {@link Widgets.nlFokkezbForm.controllers.field#Controller}.
 * @param {Object} [args.input] Properties to apply to the `Ti.UI.Label`.
 * @param {Object} [args.picker] Properties to apply to the `Ti.UI.Picker`.
 * @param {Number} [args.picker.type=Ti.UI.PICKER_TYPE_DATE] On Android, if this is `Ti.UI.PICKER_TYPE_DATE` or `Ti.UI.PICKER_TYPE_TIME` this will trigger the related dialogs.
 * @param {String} [args.picker.valueFormat="YYYY-MM-DD"] Format in which the value is set and get.
 * @param {String} [args.picker.textFormat] Format in which the value is displayed (defaults to `valueFormat`).
 * @param {String|Object} args.label Will be used for the popover title as well.
 */
(function constructor(args) {

  // save a reference to the table
  table = args.form.table;

  // extend picker defaults
  picker = _.extend(picker, args.picker || {});
  $.picker.applyProperties(picker);

  // display a hasChild marker
  $.row.applyProperties($.createStyle({
    classes: ['row']
  }));

  // Remove hasChild width to save all in same row in case of horizontal layout
  if ($.container.layout === 'horizontal') {
    $.control.width = $.control.width - 35;
  }

  // input properties to apply
  if (args.input) {
    $.input.applyProperties(args.input);
  }

  // add the input to the row
  $.setInput($.input);

  // compose view
  if (Ti.Platform.osname === 'ipad') {
    $.win.title = $.label.text;
    $.win.add($.picker);
  }

})(arguments[0]);

/**
 * Displays an option dialog to change value.
 *
 * This method is called by {@link Widgets.nlFokkezbForm.controllers.widget} when the user clicks on the row.
 */
function focus(e) {

  var date;

  if (m) {

    // picker needs a year, also for time
    if (m.year() === 0) {

      date = moment(m).year(2000).toDate();
    } else {
      date = m.toDate();
    }
  }

  $.picker.value = date;

  if (OS_IOS) {

    if (Ti.Platform.osname === 'ipad') {
      $.popover.show({
        view: $.input
      });

    } else {
      // Wrap the picker in a row
      $.pickerRow.add($.picker);
      // Update the label on change
      $.picker.addEventListener('change', function() {
        onDialogClose({
          value: $.picker.value
        });
      });

      // Check if showing the picker row already
      if (pickerShowing === false) {
        //Insert row
        table.insertRowAfter(e.index, $.pickerRow, {
          animationStyle: Ti.UI.iOS.RowAnimationStyle.DOWN
        });
        pickerShowing = true;

        // Make sure row appear in the screen
        table.scrollToIndex(e.index + 1);
      } else if (pickerShowing === true) {
        // Delete row
        table.deleteRow(e.index + 1, {
          animationStyle: Ti.UI.iOS.RowAnimationStyle.UP
        });
        pickerShowing = false;
        // Update the value on close of row
        onDialogClose({
          value: $.picker.value
        });
      }
    }

  } else if (OS_ANDROID && picker.type === Ti.UI.PICKER_TYPE_DATE) {
    $.picker.showDatePickerDialog({
      callback:onDialogClose
    });

  } else if (OS_ANDROID && picker.type === Ti.UI.PICKER_TYPE_TIME) {
    $.picker.showTimePickerDialog({
      callback: onDialogClose
    });

  } else {
    throw 'Only support iOS and Android date/time for now.';
  }
}

function setValue(value) {
  var mom = moment(value, (typeof value === 'string') ? picker.valueFormat : undefined);

  if (!mom) {
    console.error('Invalid value: ' + JSON.stringify(value));
    return;
  }

  m = mom;

  $.input.text = m.format(picker.textFormat || picker.valueFormat);
}

function getValue() {
  return m ? m.format(picker.valueFormat) : null;
}

function onSetClick(e) {

  onDialogClose({
    value: $.picker.value
  });

  onCancelClick(e);
}

function onUnsetClick(e) {
  onDialogClose({
    value: null
  });

  onCancelClick(e);
}

function onCancelClick() {
  $.popover.hide();
}

function onDialogClose(e) {

  if (!e.cancel) {
    $.setValue(e.value);
    $.change();
  }
}