import React, { Fragment,useState, useEffect } from 'react'
import Paper from '@material-ui/core/Paper';
import { useTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import {
  SortingState,
  IntegratedSorting,
  PagingState,
  IntegratedPaging,
  SearchState,
  IntegratedFiltering,
  EditingState,
  TableColumnVisibility,   
  SummaryState,
  IntegratedSummary, 
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,  
  PagingPanel,
  Toolbar,
  SearchPanel,
  TableEditRow,
  TableEditColumn,
  DragDropProvider,
  TableColumnReordering,
  TableSummaryRow,
  TableFixedColumns  
} from '@devexpress/dx-react-grid-material-ui';
import { DataTypeProvider } from '@devexpress/dx-react-grid';
import {createGuid} from '../helpers/helpers'
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TableCell from '@material-ui/core/TableCell';
// icons
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';

const styles = theme => ({
  lookupEditCell: {
    padding: theme.spacing(1),
  },
  dialog: {
    width: 'calc(100% - 16px)',
  },
  inputRoot: {
    width: '100%',
  },
  selectMenu: {
    position: 'absolute !important',
  },
});

const getRowId = row => row.ProductId;  

export default function DevExtremeReactGridMuiBasic(props) {
    const theme = useTheme(); 
    //Basic input data
    //Columns
    const [columns] = useState(props.columns);
    //const [hiddenColumnNames, setHiddenColumnNames] = useState([]);  
    const [hiddenColumnNames, setHiddenColumnNames] = useState(['ProductId',"DestinationId","ProductGroupId","UomId"]); 
    const [columnOrder, setColumnOrder] = useState(['ProductId', 
                                                    'DestinationId', 
                                                    'ProductGroupId', 
                                                    'UomId', 
                                                    'ProductGroupDescription',
                                                    'ProductName', 
                                                    'ProductDescription',
                                                    'Unitofmeasures',
                                                    'Value',
                                                    'CreationDate',
                                                    'ModifiedDate',                                                    
                                                  ]);
    const [tableColumnExtensions] = useState([
      { columnName: 'ProductGroupDescription', wordWrapEnabled: true ,width: "auto"},
      { columnName: 'ProductName', wordWrapEnabled: true ,width: "auto"},
      { columnName: 'ProductDescription', wordWrapEnabled: true ,width: "auto"},
      { columnName: 'PriceDescription', wordWrapEnabled: true ,width: "auto"},
      { columnName: 'Uomdescription', wordWrapEnabled: true ,width: "auto"},
      { columnName: 'Value', align: 'left' },
    ]); //Could generate this dynamicly from columns
    const [editingStateColumnExtensions] = useState([
      { columnName: 'CreationDate', editingEnabled: false },
      { columnName: 'ModifiedDate', editingEnabled: false },
    ]);  
    const [currencyColumns] = useState(['Value']);  
    const [dateColumns] = useState(['CreationDate','ModifiedDate']);    
    //Rows
    //const [rows, setRows] = useState(props.rows);
    //Sorting
    const [sorting, setSorting] = useState([{ columnName: 'ProductGroupDescription', direction: 'asc' }]);       
    //Paging
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [pageSizes] = useState([5, 10, 15]);
    //Searching
    const [searchValue, setSearchState] = useState('');
    //Editing
    const [editingRowIds, setEditingRowIds] = useState([]);
    const [addedRows, setAddedRows] = useState([]);
    const [rowChanges, setRowChanges] = useState({});
    const [deletedRowIds , setDeletedRowIds] = useState([]); 
    //Summary row
    const [leftFixedColumns] = useState([TableEditColumn.COLUMN_TYPE]); //Dont think this is needed
    const [totalSummaryItems] = useState([
      { columnName: 'ProductGroupDescription', type: 'count', alignByColumn: true },
      { columnName: 'Value', type: 'max', alignByColumn: true },
      //{ columnName: 'Value', type: 'sum',alignByColumn: true },
    ]);    
    
    //Providers
    const CurrencyFormatter = ({ value }) => (
      <b style={{ color: theme.palette.secondary.main }}>
        {value.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
      </b>
    );    
    const CurrencyTypeProvider = props => (
      <DataTypeProvider
        formatterComponent={CurrencyFormatter}
        {...props}
      />
    );
    const DateFormatter = ({ value }) => 
    {var formatteddate = new Date(value).toISOString().split('T')[0]
      return formatteddate
    }   
    const DateTypeProvider = props => (
      <DataTypeProvider
        formatterComponent={DateFormatter}
        {...props}
      />
    );

    //Editing methods
    //Default values when adding new row    
    
    const changeAddedRows = value => {
    console.log(value)
    setAddedRows(     
      value.map(row => (Object.keys(row).length ? row : {
        ProductId: createGuid(),
        DestinationId: "",
        ProductGroupId: "",
        UomId: "",
        ProductName: "New Product",
        ProductDescription: "New Description",
        Value : 0,
        CreationDate : new Date(),
        ModifiedDate : new Date(),
        ProductGroupDescription: availableValues.ProductGroupDescription[0],
        Unitofmeasures: availableValues.Unitofmeasures[0],
      })),
    )}

    //persist the data 

    const commitChanges = ({ added, changed, deleted }) => {
      let changedRows;
      if (added) {    
        props.handleCreate(added)         
      }
      if (changed) {
        // console.log("changed")
        // console.log(changed)
        props.handleUpdate(changed)
        //changedRows = rows.map(row => (changed[row.ProductId] ? { ...row, ...changed[row.ProductId] } : row));
      }
      if (deleted) {
        // console.log("deleted ")      
        // console.log(deleted ) 
        props.handleRemove(deleted)
        const deletedSet = new Set(deleted);      
       // changedRows = rows.filter(row => !deletedSet.has(row.ProductId));
      }
      //console.log(changedRows)
      //setRows(changedRows);        
    };

    //Custom Buttons and commands
    const AddButton = ({ onExecute }) => (
      <div style={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={onExecute}
          title="Create new row"
        >
          New
        </Button>
      </div>
    );
    
    const EditButton = ({ onExecute }) => (
      <IconButton color="secondary" onClick={onExecute} title="Edit row">
        <EditIcon />
      </IconButton>
    );
    
    const DeleteButton = ({ onExecute }) => (
      <IconButton
        onClick={() => {
          // eslint-disable-next-line
          if (window.confirm('Are you sure you want to delete this row?')) {
            onExecute();
          }
        }}
        color="secondary"
        title="Delete row"
      >
        <DeleteIcon />
      </IconButton>
    );
    
    const CommitButton = ({ onExecute }) => (
      <IconButton  color="secondary" onClick={onExecute} title="Save changes">
        <SaveIcon />
      </IconButton>
    );
    
    const CancelButton = ({ onExecute }) => (
      <IconButton color="secondary" onClick={onExecute} title="Cancel changes">
        <CancelIcon />
      </IconButton>
    );
    
    const commandComponents = {
      add: AddButton,
      edit: EditButton,
      delete: DeleteButton,
      commit: CommitButton,
      cancel: CancelButton,
    };
    
    const Command = ({ id, onExecute }) => {
      const CommandButton = commandComponents[id];
      return (
        <CommandButton
          onExecute={onExecute}
        />
      );
    };

    //Lookup dropdown
    const availableValues = {
      ProductGroupDescription: props.availablevalues.ProductGroupDescription,
      Unitofmeasures: props.availablevalues.Uomdescription,      
    };    

    const LookupEditCellBase = ({
      availableColumnValues, value, onValueChange, classes,
    }) => (
      <TableCell
        className={classes.lookupEditCell}
      >
        <Select
          value={value}
          onChange={event => onValueChange(event.target.value)}
          MenuProps={{
            className: classes.selectMenu,
          }}
          input={(
            <Input
              classes={{ root: classes.inputRoot }}
            />
          )}
        >
          {availableColumnValues.map(item => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </TableCell>
    );

    const LookupEditCell = withStyles(styles, { name: 'ControlledModeDemo' })(LookupEditCellBase); 
    
    const Cell = (props) => {
      const { column } = props;
      if (column.name === 'discount') {
        //return <ProgressBarCell {...props} />;
      }
      if (column.name === 'amount') {
        //return <HighlightedCell {...props} />;
      }
      return <Table.Cell {...props} />;
    };
    
    const EditCell = (props) => {
      const { column } = props;
      const availableColumnValues = availableValues[column.name];
      if (availableColumnValues) {
        return <LookupEditCell {...props} availableColumnValues={availableColumnValues} />;
      }
      return <TableEditRow.Cell {...props} />;
    };
    
    return (
        <Fragment>
          <Paper>
              <Grid
                  rows={props.products}
                  columns={columns}
                  getRowId={getRowId}
              >
                <SortingState
                  sorting={sorting}
                  onSortingChange={setSorting}
                />
                <PagingState
                  currentPage={currentPage}
                  onCurrentPageChange={setCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                />
                <EditingState
                  editingRowIds={editingRowIds}
                  onEditingRowIdsChange={setEditingRowIds}
                  rowChanges={rowChanges}
                  onRowChangesChange={setRowChanges}
                  addedRows={addedRows}
                  onAddedRowsChange={changeAddedRows}
                  deletedRowIds = {deletedRowIds}
                  onDeletedRowIdsChange = {setDeletedRowIds}
                  onCommitChanges={commitChanges}
                  columnExtensions={editingStateColumnExtensions}
                />
                <SearchState
                  value={searchValue}
                  onValueChange={setSearchState}
                />
                <CurrencyTypeProvider
                  for={currencyColumns}
                />
                <DateTypeProvider
                  for={dateColumns}
                />
                <SummaryState
                  totalItems={totalSummaryItems}
                />
                <IntegratedSummary />
                <IntegratedSorting />
                <IntegratedPaging />
                <IntegratedFiltering />
                <DragDropProvider />
                <Table
                  columnExtensions={tableColumnExtensions}
                  cellComponent={Cell} // dont think this is needed
                />
                <TableColumnReordering
                  order={columnOrder}
                  onOrderChange={setColumnOrder}
                />
                <TableHeaderRow showSortingControls />
                <TableEditRow
                  cellComponent={EditCell}
                />                
                <TableSummaryRow />                
                <Toolbar />
                <SearchPanel />
                <PagingPanel
                  pageSizes={pageSizes}
                />
                <TableEditRow
                  cellComponent={EditCell}
                />
                <TableEditColumn
                  showAddCommand={!addedRows.length}
                  showEditCommand
                  showDeleteCommand
                  commandComponent={Command}
                />
                <TableFixedColumns
                  leftColumns={leftFixedColumns}
                />
                <TableColumnVisibility
                  hiddenColumnNames={hiddenColumnNames}                  
                />
              </Grid>
          </Paper>            
        </Fragment>
    )
}
