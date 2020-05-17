import React, {Component} from 'react';
import Papa from 'papaparse'
import Card from './Card'
let searchQuery;
class Main extends Component {
    constructor() {
        super();
        this.state = {
            loader:true,
            data: [],
            filterData: [],
            cuisines: [],
            filters: {
                search: "",
                cuisines: "all",
                rating: "",
            },
            currency: {},
            currencyData: {},
        };
        this.rating = [
            "> 1",
            "> 2",
            "> 3",
            "> 4 "
        ];
    }

    componentWillMount() {
        this.getCsvData();
        //https://restcountries.eu/rest/v2/all?fields=currencies
    }

    fetchCsv = () => {
        return fetch('/restaurantsList.csv').then(function (response) {
            let reader = response.body.getReader();
            let decoder = new TextDecoder('utf-8');

            return reader.read().then(function (result) {
                return decoder.decode(result.value);
            });
        });
    }

    getData = (result) => {
        let data = [];
        let arr = result.data;
        let cuisines = [];
        let currency = {};
        let headings = arr[0].map((item)=>{
            if(item.includes(" ")){
                return item.split(' ').reduce((acc,val,index) => {
                    let value = val.substr(0,1).toUpperCase() + val.substr(1).toLowerCase();
                    if(index === 1){return acc.toLowerCase() + value;}
                    else return acc + value;
                });
            }
            else{
                return item.toLowerCase();
            }
        })
        for(let i=1;i<arr.length - 1;i++)
        {   let obj = {};
            arr[i].map((item,index) =>{
                obj = {...obj,
                [headings[index]]:item}
                // Unique Cuisines
                if(headings[index] === "cuisines")
                {   if(item.includes(","))
                    {
                        let array = item.split(',');
                            array.map((i)=>{
                                let value = i.trim();
                        if(!cuisines.includes(value)){
                            cuisines.push(value);
                        }
                    })
                    }
                    else{
                        let value = item.trim();
                        if(!cuisines.includes(value))
                        {
                            cuisines.push(value);
                        }
                }
                }
                //Unique Currency
                if(headings[index] === "currency" && !(Object.keys(currency).includes(item.toLowerCase())))
                { // Fetch from currency - add  symbol
                }
            });
            data.push(obj);
        }
        this.setState({data,filterData:data,cuisines,loader:false},()=>{
            console.log("data ",data);
            console.log('Cuisine',this.state.cuisines)
        });
    }

    getCsvData = async () => {
        let csvData = await this.fetchCsv();

        Papa.parse(csvData, {
            complete: this.getData
        });
    }
    filterOnSearch = () => {
        let filterData = JSON.parse(JSON.stringify(this.state.filterData));
        console.log("inside Search -- ",filterData)
        let filters = this.state.filters;
        if(filters.search)
        {
            filterData = filterData.filter((item) =>
                JSON.stringify(item).toLowerCase().includes(filters.search.toLowerCase()))
        }
        this.setState({filterData,loader:false})
    };

    onChangeHandler = (event) =>{
        let filters = JSON.parse(JSON.stringify(this.state.filters))
        let filterData = JSON.parse(JSON.stringify(this.state.data));
        filters[event.target.name] = event.target.value;
        this.setState({loader:true});
        if(event.target.id === "searchBox" || this.state.filters.search){
            //Filter the list -
            clearTimeout(searchQuery);
            searchQuery = setTimeout(this.filterOnSearch,800);
        }
        if((event.target.id === "cuisines" && event.target.value !== "all") || filters.cuisines !== "all" ) {
            console.log(event.target.value,"CUISINE");
            // event.target. value - new search value - vo search karke and
            // filter. cuisine , then - value initially not set , then -
            filterData = filterData.filter(item => item.cuisines.toLowerCase().includes(filters.cuisines.toLowerCase()));
        }
        console.log(event.target.id,"value",event.target.value);
        //If search value exist then loader will get false in that only
        this.setState({
            filters,
            filterData,
            loader:filters.search.length>0
        });
    }

    render() {
        return (
            <div>
                <div className="searchBox">
                    <input type="text" name="search" value={this.state.filters.search} onChange={this.onChangeHandler} id="searchBox"/>
                    <label className="placeholder-label" for="searchBox">Search a restaurant</label>
                </div>
                <h3>Filter By: </h3>
                <select className="filter" value={this.state.filters.cuisines} onChange={this.onChangeHandler} id="cuisines" name="cuisines">
                    <option value="all">All</option>
                    {this.state.cuisines.map((item,index)=> {
                        return <option value={item} key={index}>{item}</option>
                    })}
                </select>
                <select className="filter" id="rating" name="rating">
                    <option value="all">None</option>
                    {this.rating.map(item =>
                        (<option value={item}>{item}</option> )) }
                </select>
                <div className="filters-selected">

                </div>
                <div className="outer">
                    {this.state.loader ?
                        <div className="loader"> </div>
                        :
                        <ul className="cards">
                            {this.state.filterData.map((restaurant, index) => {
                                return <Card key={index} res={restaurant}/>
                            })}
                        </ul>
                    }
                </div>
            </div>
        );
    }
}

export default Main;