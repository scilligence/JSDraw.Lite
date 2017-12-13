REM //////////////////////////////////////////////////////////////////////////////////
REM //
REM // JSDraw.Lite
REM // Copyright (C) 2016 Scilligence Corporation
REM // http://www.scilligence.com/
REM //
REM // (Released under LGPL 3.0: https://opensource.org/licenses/LGPL-3.0)
REM //
REM //////////////////////////////////////////////////////////////////////////////////


del _merged.lite.js

type .\src\Core.js >> _merged.lite.js
type .\src\Utils.js >> _merged.lite.js
type .\src\JSDraw.Core.js >> _merged.lite.js
type .\src\JSDraw.Lite.js >> _merged.lite.js
type .\src\PT.Lite.js >> _merged.lite.js

type .\src\Atom.js >> _merged.lite.js
type .\src\BA.js >> _merged.lite.js
type .\src\Base64.js >> _merged.lite.js
type .\src\Bond.js >> _merged.lite.js
type .\src\JSDrawIO.js >> _merged.lite.js
type .\src\Mol.js >> _merged.lite.js
type .\src\Point.js >> _merged.lite.js
type .\src\Rect.js >> _merged.lite.js
type .\src\Stack.js >> _merged.lite.js
type .\src\SuperAtoms.js >> _merged.lite.js
type .\src\FormulaParser.js >> _merged.lite.js
type .\src\Toolbar.js >> _merged.lite.js
type .\src\Lasso.js >> _merged.lite.js
type .\src\Drawer.js >> _merged.lite.js
type .\src\Language.js >> _merged.lite.js
type .\src\IDGenerator.js >> _merged.lite.js
type .\src\Skin.js >> _merged.lite.js
type .\src\JSDraw.Editor.js >> _merged.lite.js
type .\src\JSDraw.Table.js >> _merged.lite.js
type .\src\Bracket.js >> _merged.lite.js
type .\src\Group.js >> _merged.lite.js
type .\src\Text.js >> _merged.lite.js

type .\form\Lang.js >> _merged.lite.js
type .\form\Menu.js >> _merged.lite.js
type .\form\ContextMenu.js >> _merged.lite.js
type .\form\Dialog.js >> _merged.lite.js
type .\form\Form.js >> _merged.lite.js
type .\form\AutoComplete.js >> _merged.lite.js
type .\form\Progress.js >> _merged.lite.js
type .\form\Table.js >> _merged.lite.js
type .\form\Tree.js >> _merged.lite.js
type .\form\DropdownInput.js >> _merged.lite.js
type .\form\Popup.js >> _merged.lite.js
type .\form\UploadFile.js >> _merged.lite.js
type .\form\Tab.js >> _merged.lite.js
type .\form\TabbedForm.js >> _merged.lite.js
type .\form\FieldNumber.js >> _merged.lite.js
type .\form\Chart.js >> _merged.lite.js
type .\form\Clipboard.js >> _merged.lite.js
type .\form\Accordion.js >> _merged.lite.js
type .\form\DnD.js >> _merged.lite.js
type .\form\Resizable.js >> _merged.lite.js
type .\form\Favorite.js >> _merged.lite.js
type .\form\DropdownButton.js >> _merged.lite.js
type .\form\App.Lite.js >> _merged.lite.js

type .\page\Page.js >> _merged.lite.js
type .\page\Page.Custom.js >> _merged.lite.js
type .\page\Page.Explorer.js >> _merged.lite.js
type .\page\Page.ExplorerForm.js >> _merged.lite.js
type .\page\Page.Form.js >> _merged.lite.js
type .\page\Page.Tab.js >> _merged.lite.js
type .\page\Page.Table.js >> _merged.lite.js
type .\page\Page.Tree.js >> _merged.lite.js
