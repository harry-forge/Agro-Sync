import { StyleSheet, TextInput, View } from 'react-native';
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";

const Input = (props) => {
    return (
        <View style={[styles.container, props.containerStyles && props.containerStyles]}>
            {
                props.icon && props.icon
            }
            <TextInput
                style={{
                    flex: 1, 
                    color: theme.colors.text,
                    fontSize: 16,
                    fontWeight: theme.fonts.medium
                }}
                placeholderTextColor={theme.colors.textLight}
                ref={props.inputRef && props.inputRef}
                {...props}
            />
        </View>
    )
}
export default Input
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: hp(7.2),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.xxl,
        borderCurve: 'continuous',
        paddingHorizontal: 18,
        gap: 12,
    }
})
