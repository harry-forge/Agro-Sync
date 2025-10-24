import React from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {theme} from "../../constants/theme";

export default function Icons({name, color, size}) {
    return (
        <Feather
            name = {name}
            color={color || theme.colors.rose}
            size={size || 24}
        />
    )
}