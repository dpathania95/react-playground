import { useEffect, useState, useCallback, useRef } from "react";

let cacheResult = {};

const useFetchSuggestions = () => {
  const [result, setSearchResult] = useState([]);
  const [errorMsg, setErrorMsg] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef({});

  const handleUpdateCache = (key, results) => {
    cacheResult[key] = {timestamp: Date.now(), data: results};
  }

  const handleFetchSuggestions = useCallback(async (searchQuery) => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://dummyjson.com/recipes/search?q=${searchQuery}`);
      const result = await response.json();
      setSearchResult(result.recipes);
      handleUpdateCache(searchQuery, result.recipes);
    } catch(e) {
      setErrorMsg(e.error || 'Failed to get results');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSetSearchResult = (data) => setSearchResult(data);

  const handleFetchCache = () => {
    let latestResult = [];
    let latestTimestamp = null;
    for (let key in cacheResult) {
      if (!latestTimestamp) {
        latestTimestamp = cacheResult[key].timestamp;
        latestResult = cacheResult[key].data;
      } else if (latestResult < cacheResult[key].timestamp) {
        latestResult = cacheResult[key].data;
      }

    }
    setSearchResult(latestResult);
  }

  const fetchSuggestions = useCallback((query) => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      handleFetchSuggestions(query);
    }, 500);
  }, [handleFetchSuggestions])

  return {
    data: result,
    errorMsg,
    fetchSuggestions,
    setResults: handleSetSearchResult,
    isLoading,
    fetchCache: handleFetchCache
  }
};


const Autocomplete = (props) => {
  const {fetchSuggestions, customStyles={}, placeholder, data, dataKey, onFocus, onBlur, isLoading, customLoader, setResults} = props;
  const [searchText, setSearchText] = useState('');

  const handleChange = (e) => {
    setSearchText(e.target.value);
  }

  useEffect(() => {
    if (searchText) fetchSuggestions(searchText);
  }, [searchText, fetchSuggestions]);

  const handleOnSelect = (value) => {
    setSearchText(value);
    setResults([]);
  }

  return (
    <div style={{ width: '500px', margin: 'auto'}}>
      <input
        value={searchText}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{...customStyles, height: '44px', borderRadius: '16px', width: '100%', fontSize: '16px'}}
        placeholder={placeholder || 'Enter input'}
      />
      <div style={{backgroundColor: '#FFF', maxHeight: '300px', overflowY: 'auto'}}>
        {isLoading && customLoader}
        {data?.length > 0 && <ResultList data={data} dataKey={dataKey} onSelect={handleOnSelect} />}
      </div>
    </div>
  )
}


const ResultList = (props) => {
  const {data = [], dataKey, onSelect} = props;

  const handleOnClick = (e) => {
    onSelect(e.target.innerHTML)
  }

  return (
    <ul style={{padding: '0px 10px'}}>
      {data?.map((item) => (
        <li
          onClick={handleOnClick}
          key={item.id}
          style={{display: "flex", alignItems: 'center', fontSize: '16px', gridGap: '8px', cursor: 'pointer', margin: '6px 0px'}}
        >
          {item.image && <img src={item.image} height={40} width={40}/>}
          <span>{item[dataKey]}</span>
        </li>
      ))}
    </ul>
  );
}




export default function AutocompleteProblem() {
  const {fetchSuggestions, setResults, data, errorMsg, isLoading, fetchCache} = useFetchSuggestions();

  const handleOnBlur = () => {
    setResults([]);
  }

  const handleOnFocus = () => {
    fetchCache();
  }

  return (
    <div>
      <Autocomplete
        fetchSuggestions={fetchSuggestions}
        customLoader={<div>loading suggestions</div>}
        isLoading={isLoading}
        data={data}
        dataKey={'name'}
        placeholder={'Enter recipes'}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
        customStyles={{}}
        errorMsg={errorMsg}
        setResults={setResults}
      />
    </div>
  )
}