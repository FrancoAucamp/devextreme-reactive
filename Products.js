import React, {Fragment,useState,useEffect} from 'react'
import PropTypes from 'prop-types';
import { makeStyles , useTheme  } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import { useUser} from '../../Authentication/useUser'
import { useApi } from '../../../Api/useApi'; 
import { createGuid } from '../../../helpers/helpers';
import { useSnackbar } from 'notistack';
import TableComponant from "../../../componants/TableComponant";
import DevExtremeReactGridMUI from "../../../componants/DevExtremeReactGridMUI";
import DevExtremeReactGridMuiBasic from "../../../componants/DevExtremeReactGridMuiBasic";
import TabsComponant from '../../../componants/TabsComponant'

import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
//icons
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import ShoppingBasketIcon from '@material-ui/icons/ShoppingBasket';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import ImageIcon from '@material-ui/icons/Image';


const useStyles = makeStyles(theme => ({
    formContainer: {
        minWidth : 300,
        maxWidth : 650,
        display: 'flex',
        flexFlow: 'row wrap'
    },   
    paper:{
        marginTop: '20px',           
        padding: '20px',
        backgroundColor: "gray"
    },
    Productdiv: {        
        //fontFamily: 'Muli,Roboto,Helvetica Neue,Arial,sans-serif',      
        fontSize: '14px',
        vh: '9.47px',
        lineHeight: '1.4',
        boxSizing: 'border-box',
        borderWidth: 0,
        borderStyle: 'solid',
        backgroundColor: '#ffffff',
        color: '#ffffff',
        display: 'flex',
        maxHeight: '136px',
        height: '13.6rem',
        minHeight: '13.6rem',
    },
    Tablediv: {
        fontFamily: 'Muli,Roboto,Helvetica Neue,Arial,sans-serif',
        vh: '9.47px',
        fontSize: '14px',
        lineHeight: '1.4',
        color: 'rgba(0, 0, 0, 0.87)',
        boxSizing: 'borderBox',
        borderWidth: 0,
        borderStyle: 'solid',
        flex: '1 1 100%',
        display: 'flex',
        //boxShadow: '0px' '2px' '1px' '-1px' 'rgba(0,0,0,0.2)','0px' '1px' '1px' '0px' 'rgba(0,0,0,0.14)','0px' '1px' '3px' '0px' 'rgba(0,0,0,0.12)',
        minHeight: 0,
        borderRadius: '8px 8px 0 0',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',

    },
}));

export default function Products() {     
    const classes = useStyles();
    const { user } = useUser()  
    const columnvaluesinitial = [
        {name: "ProductId", title: "ProductId"},
        {name: "DestinationId", title: "DestinationId"},
        {name: "ProductGroupId", title: "ProductGroupId"},
        {name: "UomId", title: "UomId"},      
        {name: "ProductName", title: "Product Name"},
        {name: "ProductDescription", title: "Product Description"},       
        {name: "Value", title: "Amount"},
        {name: "CreationDate", title: "Created"},
        {name: "ModifiedDate", title: "Last Modified"},       
        //calculated
        {name: "ProductGroupDescription", title: "Product Group"},
        {name: "Unitofmeasures", title: "Unit of Measure"}
       
        // {name: "ProductGroupDescription", title: "Product Group", getCellValue: row => (row.Productgroups ? row.Productgroups.ProductGroupDescription : undefined),},
        // {name: "Unitofmeasures", title: "Unit of Measure", getCellValue: row => (row.Unitofmeasures ? row.Unitofmeasures.Uomdescription : undefined),},

    ]   
    const [isloading, setIsloading] = useState(true);
    const [columns, setColumns] = useState(columnvaluesinitial)   
    const [availablevalues, setAvailablevalues] = useState({})
    const [products, setProducts] = useState()
    const [productgroup, setProductgroup] = useState()
    const [uom, setUom] = useState()


    const [tabvalue, setTabvaluee] = useState(0)
    const theme = useTheme();
    
    //Api     
    let productsapi = useApi(false,"products/",false);    
    let productgroupapi = useApi(false,"productgroups/",false);   
    let uomapi = useApi(false,"uom/",false);   
     
    useEffect(() => {
        loaddata()              
    }, [])   

    async function loaddata() {   
        //do a check to see if there is a destinationid
        //if(user.destinationId = null || undefined) {alert("no destination id found"); return }             
        //Get all the data from the api
        Promise.all([productsapi.getspecific("GetBy/" + user.destinationId),
                     productgroupapi.getall(),
                     uomapi.getall()
                   ])         
        .then((values) => {
            setProducts(formatproducts(values[0].data))           
            setProductgroup((values[1].data))
            setUom((values[2].data))
            setAvailablevalues({ProductGroupDescription: formatavailablecolumsdata(values[1].data), Uomdescription:  formatavailablecolumsdata(values[2].data)})         
        })       
        .then(() => {setIsloading(false)})         
    }

    function formatproducts(productsapi) {
        var result = productsapi.map(product => 
           (
            {
                ProductId: product.ProductId,
                DestinationId: product.DestinationId,
                ProductGroupId: product.ProductGroupId,
                UomId: product.UomId,
                ProductName: product.ProductName,
                ProductDescription: product.ProductDescription,
                Value: product.Value,
                CreationDate:product.CreationDate,
                ModifiedDate: product.ModifiedDate,
                ProductGroupDescription: product.Productgroups.ProductGroupDescription,
                Unitofmeasures: product.Unitofmeasures.Uomdescription
            }
           )
        )
        return result
    }    

    function formatavailablecolumsdata(dataset) {
        var result = dataset.map(item => item[Object.keys(item)[1]]);       
        return result     
    }

    //datagrid callback functions   
    async function handleCreate(added) {       
        var newproduct = {
            ProductId: added[0].ProductId,
            DestinationId: user.destinationId,
            ProductGroupId: getproductgroupid(added[0].ProductGroupDescription),
            UomId: getuomid(added[0].Unitofmeasures),
            ProductName: added[0].ProductName,
            ProductDescription: added[0].ProductDescription,
            Value : parseInt(added[0].Value),
            CreationDate : added[0].CreationDate,
            ModifiedDate : added[0].ModifiedDate,
            // ProductGroupDescription: added[0].ProductGroupDescription,
            // Unitofmeasures: added[0].Unitofmeasures
          }              
          productsapi.create([newproduct])
          setProducts([...products,newproduct])   
    }            
    
    async function handleRemove(productid) {      
       setProducts(products.filter(product => product.ProductId !== productid[0]))      
       productsapi.remove(productid[0])
    }
    async function handleUpdate(product) {       
       console.log("handleUpdate")
       console.log(product)
    }

    function getproductgroupid(productgroupname) {        
        var productgroupid = null       
        if(productgroup) {           
            productgroup.map((item) => {
                if (item.productGroupDescription == productgroupname) 
                {                                 
                    productgroupid = item.productGroupId 
                }                   
            })
        } 
        return productgroupid
    }

    function getuomid(uomdescription) {        
        var uomid = null       
        if(uom) {           
            uom.map((item) => {
                if (item.uomdescription == uomdescription) 
                {                                 
                    uomid = item.uomid 
                }                   
            })
        }
        return uomid
    }

    //Handle Tabs
    const handleChange = (event, newValue) => {
        setTabvaluee(newValue);
    };

    const handleChangeIndex = index => {
        setTabvaluee(index);
    };

    function TabPanel(props) {
        const { children, value, index, ...other } = props;
      
        return (
          <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
          >
            {value === index && <Box p={3}>{children}</Box>}
          </Typography>
        );
    }
      
    TabPanel.propTypes = {
      children: PropTypes.node,
      index: PropTypes.any.isRequired,
      value: PropTypes.any.isRequired,
    };
      
    function a11yProps(index) {
      return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
      };
    } 

    const handleClick = () => {      
        console.log(products)  
        console.log(productgroup)  
        console.log(uom)       
    };  

    return (
        <Fragment>   
            <Typography color='secondary' variant="h5" >
                    <ShoppingBasketIcon/> Products              
            </Typography>
            {String(isloading)}
            <Button 
                variant="contained"
                color = "secondary"
                onClick={handleClick}>
                Get Values from Parent Products
            </Button> 
           
            <br/>   

            <Tabs
                value={tabvalue}
                onChange={handleChange}
                indicatorColor="secondary"
                textColor="secondary"
                variant="fullWidth"
                aria-label="full width tabs"
            >
                <Tab icon={<ShoppingBasketIcon/>} label="All products" {...a11yProps(0)} />
                <Tab icon={<ImageIcon/>} label="Accommodation" {...a11yProps(1)} />
                <Tab icon = {<MonetizationOnIcon/>} label="Hunting Price list" {...a11yProps(2)} />
            </Tabs>

            <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={tabvalue}
                onChangeIndex={handleChangeIndex}
            >
                <TabPanel value={tabvalue} index={0} dir={theme.direction}>
                    {isloading ? <CircularProgress color="secondary"/> :                                    
                                 <DevExtremeReactGridMuiBasic
                                     products = {products}                                   
                                     columns = {columns}
                                     availablevalues = {availablevalues}                                                                          
                                     handleCreate = {handleCreate}     
                                     handleRemove = {handleRemove}     
                                     handleUpdate = {handleUpdate}                                                            
                                 >                                
                                 </DevExtremeReactGridMuiBasic>                  
                    }
                </TabPanel>
                <TabPanel value={tabvalue} index={1} dir={theme.direction}>
                   
                </TabPanel>
                <TabPanel value={tabvalue} index={2} dir={theme.direction}>
                    {/* {isloading ? <CircularProgress color="secondary"/> :                                
                                 <DevExtremeReactGridMUI
                                     rows = {products}                                   
                                     columns = {columns}                                     
                                     productgroup = {productgroup}    
                                     uom = {uom}                                 
                                 >                                
                                 </DevExtremeReactGridMUI>                  
                    } */}
                </TabPanel>
            </SwipeableViews>        
           
        </Fragment>
    )
}
