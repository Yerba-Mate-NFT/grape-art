
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { decodeMetadata } from '../utils/grapeTools/utils'
// @ts-ignore
import fetch from 'node-fetch'
import { PublicKey } from '@solana/web3.js';

import {
    Pagination,
    Stack,
    Typography,
    Grid,
    Box,
    Skeleton,
    ListItemButton,
} from '@mui/material';

import {
    METAPLEX_PROGRAM_ID,
  } from '../utils/auctionHouse/helpers/constants';

import { GRAPE_PREVIEW } from '../utils/grapeTools/constants';

export default function GalleryItem(props: any){
    const MD_PUBKEY = METAPLEX_PROGRAM_ID;
    const collectionitem = props.collectionitem || [];
    const mint = collectionitem?.wallet?.account?.data.parsed.info.mint || collectionitem?.wallet?.address || null;
    const [expanded, setExpanded] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [collectionmeta, setCollectionMeta] = React.useState(null);
        //const [collectionrawdata, setCollectionRaw] = React.useState(props.collectionitemmeta || null);
        
        const handleExpandClick = () => {
            setExpanded(!expanded);
        };
        
        const getCollectionData = async () => {
            if (collectionitem){
                try {
                    let meta_primer = collectionitem;
                    let buf = Buffer.from(meta_primer.data, 'base64');
                    let meta_final = decodeMetadata(buf);
                    try{
                        const metadata = await fetch(meta_final.data.uri)
                        .then(
                            (res: any) => res.json()
                        );
                        return metadata;
                    }catch(ie){
                        // not on Arweave:
                        //console.log("ERR: "+JSON.stringify(meta_final));
                        return null;
                    }
                } catch (e) { // Handle errors from invalid calls
                    console.log(e);
                    return null;
                }
            }
        }

        const getCollectionMeta = async () => {
            if (!loading){
                setLoading(true);
                let [collectionmeta] = await Promise.all([getCollectionData()]);
                setCollectionMeta({
                    collectionmeta
                });
                setLoading(false);
            }
        }

        useEffect(() => {
            const interval = setTimeout(() => {

                if (mint)
                    getCollectionMeta();
            }, 500);
            return () => clearInterval(interval); 
        }, [collectionitem]);
        
        if((!collectionmeta)||
            (loading)){
            //getCollectionMeta();
            //setTimeout(getCollectionMeta(), 250);
            return (
                <ListItemButton
                    sx={{
                        width:'100%',
                        borderRadius:'25px',
                        p: '2px',
                        mb: 5
                    }}
                >
                    <Skeleton 
                        sx={{
                            borderRadius:'25px',
                        }}
                        variant="rectangular" width={325} height={325} />
                </ListItemButton>
            )
        } //else{
        {   
            let image = collectionmeta.collectionmeta?.image || null;
            try{
                if (image){
                    if ((image?.toLocaleUpperCase().indexOf('?EXT=PNG') > -1) ||
                        (image?.toLocaleUpperCase().indexOf('?EXT=JPEG') > -1)){
                            //image = image.slice(0, image.indexOf('?'));
                            image = 'https://solana-cdn.com/cdn-cgi/image/width=256/'+image;
                    }
                }
            }catch(e){console.log("ERR: "+e)}
            
            if (!image){
                //console.log("!image ERR: " + JSON.stringify(collectionmeta));
                return null;
            } else {
            //console.log("Mint: "+mint);
            //if ((collectionmeta)&&(!loading)){
            //if (image){
                return (
                        <>
                            {collectionmeta &&
                                <Grid 
                                    container 
                                    alignItems="center"
                                    justifyContent="center">
                                    <Grid item sx={{display:'flex',justifyContent:'center',alignItems:'center'}}>
                                        <ListItemButton
                                            component={Link} to={`${GRAPE_PREVIEW}${mint}`}
                                            sx={{
                                                width:'100%',
                                                borderRadius:'25px',
                                                p: '2px'
                                            }}
                                        >
                                            <img
                                                src={`${image}`}
                                                srcSet={`${image}`}
                                                alt={collectionmeta.collectionmeta?.name}
                                                //onClick={ () => openImageViewer(0) }
                                                loading="lazy"
                                                height="auto"
                                                style={{
                                                    width:'100%',
                                                    borderRadius:'24px'
                                                }}
                                            />
                                        </ListItemButton>
                                    </Grid>
                                    <Grid item sx={{display:'flex'}}>
                                        <Box
                                            sx={{p:1}}
                                        >
                                            <Typography variant="caption">
                                                {collectionmeta.collectionmeta?.name}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            }
                        </>
                );
            }
            //}
        }
}